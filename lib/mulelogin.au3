; Remove the ; from the next line if you get script errors
; Or you can add a ; to disable it (i.e: ;#RequireAdmin)
#RequireAdmin

#include <String.au3>
#include <File.au3>
#include <Array.au3>

Global $string, $password, $email, $data, $path, $search, $file, $root
$root = "HKEY_CLASSES_ROOT\muledump"
$title = "Muledump One Click Login Installer"
$adminRightsError = "Error - Requires Admin Privileges" & @CRLF & @CRLF & "Edit mulelogin.au3 in a text editor to enable admin rights at the top" & @CRLF & @CRLF & "For more help see:" & @CRLF & "https://github.com/jakcodex/muledump/wiki/One-Click-Login"

Func _write()
	RegWrite($root,"","REG_SZ","URL: muledump Protocol")
	RegWrite($root,"URL Protocol","REG_SZ","")
	RegWrite($root & "\shell")
	RegWrite($root & "\shell\open")
	RegWrite($root & "\shell\open\command","","REG_SZ", @AutoItExe & ' "' & @ScriptFullPath & '" %1')
	If RegRead("HKEY_CLASSES_ROOT\muledump","") Then
		MsgBox(64,$title,"One Click Login: installed" & @CRLF & @CRLF & "You should open mulelogin.au3 in a text editor and disable:" & @CRLF & "#RequireAdmin")
	Else
		MsgBox(16,$title,$adminRightsError)
	EndIf
	Exit
EndFunc

Func _install()
	Local $k
	$k = RegEnumKey($root, 1)
	If @error == 2 Then
		MsgBox(16,$title,$adminRightsError)
		Exit
	EndIf
	If @error == 1 Then _write()
	$k = MsgBox(6 + 32, $title, _
		'One Click Login is already installed. What would you like to do?' & @CRLF & @CRLF & _
		'"Cancel" to do nothing' & @CRLF & _
		'"Try Again" to reinstall' & @CRLF & _
		'"Continue" to uninstall')
	If $k == 10 Then _write()
	If $k == 11 Then
		RegDelete($root)
		if @error <> 0 Then
			MsgBox(16,$title,$adminRightsError)
		Else
			MsgBox(64,$title,"One Click Login: uninstalled")
		EndIf
	EndIf
	Exit
EndFunc

Func _length($string)
	Local $binlength, $declength, $array, $result
	$declength = StringLen($string)/2
    While $declength > 0
        $binlength &= Mod($declength,2)
        $declength = Floor($declength/2)
    WEnd
	$binlength = StringReverse($binlength)
	if @error <> 0 Then
		$binlength = _StringReverse($binlength)
	EndIf
	$binlength = $binlength & "1"
	$array = StringSplit($binlength,"")
	For $i = 1 To $array[0]
        $array[0] -= 1
        If $array[$i] = "1" Then $result += 2 ^ ($array[0])
	Next
	Return Hex(Int($result),2)
EndFunc

Func _build()
	;header
	$string  = "0x 00 BF" 						;Magic Number		 2 bytes
	$string &= "?? ?? ?? ??"					;Size				 4 bytes
	$string &= "54 43 53 4F 00 04 00 00 00 00"	;Marker				10 bytes
	$string &= "00 05"							;Name Size			 2 bytes
	$string &= "52 6F 74 4D 47"					;"RotMG"			 5 bytes
	$string &= "00 00 00"						;Padding			 3 bytes
	$string &= "03"								;AMF Version		 1 byte

	;data
	$string &= "11"								;Length				 1 byte
	$string &= "50 61 73 73 77 6F 72 64"		;"Password"			 8 bytes
	$string &= "06"								;Type (string) 		 1 byte
	$string &= _length($password)				;Length				 1 byte
	$string &= $password						;Actual Password	 ? bytes
	$string &= "00"								;AMF Padding		 1 byte

	$string &= "09"								;Length				 1 byte
	$string &= "47 55 49 44"					;"GUID"				 4 bytes
	$string &= "06"								;Type (string)		 1 byte
	$string &= _length($email)					;Length				 1 byte
	$string &=  $email							;Email				 ? bytes
	$string &= "00"								;AMF Padding		 1 byte

	$string = StringReplace($string," ","")
	$string = StringRegExpReplace($string,"\?{8}",Hex(Int(StringLen(StringMid($string,15))/2)))
EndFunc

If $CmdLine[0] = 0 Then _install()

$data = StringReplace($CmdLine[1],"muledump:","")
$data = StringSplit($data,"-")
$email = $data[1]
$password = $data[2]

_build()

Local $paths_base[2] = [ _
	@AppDataDir & "\Macromedia\Flash Player\#SharedObjects\", _
	_PathFull("../Local", @AppDataDir) & "\Google\Chrome\User Data\Default\Pepper Data\Shockwave Flash\WritableRoot\#SharedObjects\" _
]
Local $paths[3] = [ _
	"localhost", _
	"realmofthemadgodhrd.appspot.com", _
	"www.realmofthemadgod.com" _
]
For $path_base In $paths_base
	$search = FileFindFirstFile($path_base & "*")
	$searchPath = FileFindNextFile($search)
	For $gameDir In $paths
		$gameFilePath = $path_base & $searchPath & "\" & $gameDir & "\RotMG.sol"
		$file = FileOpen($gameFilePath,26)
		FileWrite($file,$string)
		FileClose($file)
	Next
Next
FileClose($search)

;;
; launch one-click login
;;

; run one-click login thru the browser
ShellExecute("https://www.realmofthemadgod.com/")

;;
; replace the line above with one of the following if you're using a projector
;;

; run one-click login thru flash projector
; update the path to your flash projector exe
; https://www.adobe.com/support/flashplayer/debug_downloads.html
;ShellExecute('C:\flashplayer_28_sa.exe', 'https://www.realmofthemadgod.com/client')

; run one-click login thru totalcmd + swfview
; https://www.ghisler.com/
;ShellExecute('C:\Program Files\Total Commander\Totalcmd.exe', '/S=L:Pswfview e:\temp\rotmg\loader.swf')
