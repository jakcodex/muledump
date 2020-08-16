;;
;; One Click Login v2
;; + Runtime parameter support
;; + https://github.com/jakcodex/muledump/wiki/One+Click+Login for more information
;;
;; If configuring via Muledump then you don't need to change anything in this file.
;; Be sure to run the script with AutoIt and choose "reinstall" if prompted.
;;

Global $config = ObjCreate("Scripting.Dictionary")

;;  select mode (accepts: browser, flash)
$config.Add("mode", "browser");

;;  path to use for browser
$config.Add("path", "https://www.realmofthemadgod.com/legacy");

;;  path to use for flash projector
;;  $config.Add("path", "c:\users\me\Downloads\flashplayer_18.exe");

;;  path to the game client
$config.Add("client", "https://www.realmofthemadgod.com/client");

;;  run in admin mode
$config.Add("admin", "false");

;;  enable runtime parameter support
$config.Add("params", "true")

;;  enable setting admin permissions via runtime params
$config.Add("adminparams", "false")

;;  enforce parameter security
$config.Add("paramsecurity", "true")

;;  parameter separator
$config.Add("paramseparator", "++++")

;;  output debugging information
$config.Add("debug", "false")

;;  search paths
$config.Add("paths", "localhost,www.realmofthemadgod.com,test.realmofthemadgod.com,#localWithNet")

;;  default window title
$config.Add("title", "Muledump One Click Login")

;;  account ign (included by request)
$config.Add("ign", "");

#include <String.au3>
#include <File.au3>
#include <Array.au3>

Global $string, $password, $email, $data, $path, $search, $file, $root
$root = "HKEY_CLASSES_ROOT\muledump"
$title = "Muledump One Click Login Installer"
$adminRightsError = "Error - Requires Admin Privileges" & @CRLF & @CRLF & "Either edit mulelogin.au3 in a text editor and set 'admin' to true in the config or update your request parameters" & @CRLF & @CRLF & "For more help see:" & @CRLF & "https://github.com/jakcodex/muledump/wiki/One-Click-Login"

Func _GetAdminRights()
    If Not IsAdmin() and $config.Item("admin") == "true" Then
        ShellExecute(@AutoItExe, $CmdLineRaw, "", "runas")
        ProcessClose(@AutoItPID)
        Exit
    EndIf
EndFunc

Func _error($msg='There was an error')
    MsgBox(0, "Error", $msg)
    ConsoleWrite("state:false")
    Exit
EndFunc

Func _write()
	RegWrite($root,"","REG_SZ","URL: muledump Protocol")
	RegWrite($root,"URL Protocol","REG_SZ","")
	RegWrite($root & "\shell")
	RegWrite($root & "\shell\open")
	RegWrite($root & "\shell\open\command","","REG_SZ", @AutoItExe & ' "' & @ScriptFullPath & '" %1')
	If RegRead("HKEY_CLASSES_ROOT\muledump","") Then
		MsgBox(64,$title,"One Click Login: installed" & @CRLF & @CRLF & "Now go to Muledump and click Setup > Settings > One Click Login to finish setup")
	Else
		MsgBox(16,$title,$adminRightsError)
	EndIf
	Exit
EndFunc

Func _install()
    $config.Item('admin') = 'true';
    _GetAdminRights()
	Local $k
	$k = RegEnumKey($root, 1)
	If @error == 2 Then
		MsgBox(16,$title,$adminRightsError)
		Exit
	EndIf
	If @error == 1 Then _write()
	$k = MsgBox(6 + 32, $title, _
		'One Click Login is already installed.' & @CRLF & @CRLF & 'What would you like to do?' & @CRLF & @CRLF & _
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

Func _ProcessGetHWnd($iPid, $iOption = 1, $sTitle = "", $iTimeout = 2000)
    Local $aReturn[1][1] = [[0]], $aWin, $hTimer = TimerInit()

    While 1

        ; Get list of windows
        $aWin = WinList($sTitle)

        ; Searches thru all windows
        For $i = 1 To $aWin[0][0]

            ; Found a window owned by the given PID
            If $iPid = WinGetProcess($aWin[$i][1]) Then

                ; Option 0 or 1 used
                If $iOption = 1 OR ($iOption = 0 And $aWin[$i][0] <> "") Then
                    Return $aWin[$i][1]

                ; Option 2 is used
                ElseIf $iOption = 2 Then
                    ReDim $aReturn[UBound($aReturn) + 1][2]
                    $aReturn[0][0] += 1
                    $aReturn[$aReturn[0][0]][0] = $aWin[$i][0]
                    $aReturn[$aReturn[0][0]][1] = $aWin[$i][1]
                EndIf
            EndIf
        Next

        ; If option 2 is used and there was matches then the list is returned
        If $iOption = 2 And $aReturn[0][0] > 0 Then Return $aReturn

        ; If timed out then give up
        If TimerDiff($hTimer) > $iTimeout Then ExitLoop

        ; Waits before new attempt
        Sleep(Opt("WinWaitDelay"))
    WEnd


    ; No matches
    SetError(1)
    Return 0
EndFunc

If $CmdLine[0] = 0 Then _install()

;;  process the command input
$data = StringReplace($CmdLine[1],"muledump:","")
$data = StringSplit($data,"-")
$email = $data[1]
$password = $data[2]

;; if parameters were passed we will parse them into the runtime config
If UBound($data) == 4 and $config.Item("params") == "true" Then

    $params = StringSplit($data[3], $config.Item("paramseparator"))
    If IsArray($params) Then

        Local Const $paramsLength = UBound($params)
        For $i = 0 To $paramsLength-1

            $paramPieces = StringSplit($params[$i], "=")
            If IsArray($paramPieces) Then
                If $config.Exists($paramPieces[1]) Then

                    If $paramPieces[1] == "paramsecurity" Then ContinueLoop

                    ;;  supplied path must be one of the already configured paths
                    If $config.Item("paramsecurity") == "true" and $paramPieces[1] == "paths" Then
                        Local $result = StringInStr($config.Item("paths"), $paramPieces[2])
                        If @error or $result == 0 Then _error("Invalid paths provided")
                    EndIf

                    If $config.Item("paramsecurity") == "true" and $paramPieces[1] == "admin" and $config.Item("adminparams") == "false" Then ContinueLoop
                    If $paramPieces[2] == "" Then ContinueLoop

                    $config.Item($paramPieces[1]) = $paramPieces[2]
                    $config.Item($paramPieces[1]) = StringReplace($config.Item($paramPieces[1]), "%5C", "\")
                    $config.Item($paramPieces[1]) = StringReplace($config.Item($paramPieces[1]), "%2F", "/")

                EndIf
            EndIf

        Next
    EndIf
EndIf

;;  obtain admin privileges if enabled
_GetAdminRights()

;;  display debugging information
If $config.Item("debug") == "true" Then
    MsgBox(0, "Config", "admin => " & $config.Item("admin") & @CRLF & "mode => " & $config.Item("mode") & @CRLF & "path => " & $config.Item("path") & @CRLF & "paths => " & $config.Item("paths") & @CRLF);
EndIf

_build()

Local $paths_base[2] = [ _
	@AppDataDir & "\Macromedia\Flash Player\#SharedObjects\", _
	@LocalAppDataDir & "\Google\Chrome\User Data\Default\Pepper Data\Shockwave Flash\WritableRoot\#SharedObjects\" _
]
Local $paths = StringSplit($config.Item("paths"), ",", 2)
For $path_base In $paths_base
	$search = FileFindFirstFile($path_base & "*")

	; flash was never run from this application,
	; prevent generating degenerate folder stucture
	if @error Then ContinueLoop

	While 1
		$sandbox = FileFindNextFile($search)

		; no more sandboxes
		If @error Then ExitLoop

		; verify that the folder name corresponds to a sandbox id (8 uppercase chars)
		if StringLen($sandbox) = 8 And StringUpper($sandbox) == $sandbox Then
			For $gameDir In $paths
				$gameFilePath = $path_base & $sandbox & "\" & $gameDir & "\RotMG.sol"
				$file = FileOpen($gameFilePath,26)
				FileWrite($file,$string)
				FileClose($file)
			Next
		EndIf
	WEnd
Next
FileClose($search)

;;
; launch one-click login
;;

Global $pid = 0
If $config.Item("mode") == "browser" Then

    If $config.Item("params") == "true" and $config.Item("paramsecurity") == "true" Then
        Local $result = StringRegExp($config.Item("path"), "^https://(realmofthemadgodhrd\.appspot.com|(([a-zA-Z0-9]*)\.(realmofthemadgod\.com)))(\/?|\/[a-zA-Z0-9-_]*?)$");
        If @error or $result == 0 Then _error("Invalid path provided: " & $config.Item("path") & @CRLF & @CRLF & "If the value is correct then try disabling param security in the au3 file config.")
    EndIf

    ShellExecute($config.Item("path"))

ElseIf $config.Item("mode") == "flash" Then

    If $config.Item("params") == "true" and $config.Item("paramsecurity") == "true" Then
        Local $result
        $result = StringRegExp($config.Item("path"), "^[a-zA-Z]:\\[a-zA-Z0-9-_\\]*?(flashplayer|flash|flashprojector|flashplayer_[a-zA-Z0-9-_\.]*?)\.exe$");
        If @error or $result == 0 Then _error("Invalid path provided: " & $config.Item("path") & @CRLF & @CRLF & "If the value is correct then try disabling param security in the au3 file config.")

        $result = StringRegExp($config.Item("client"), "^(https://([a-zA-Z0-9]*)\.(realmofthemadgod\.com)(\/?|\/.*)|[a-zA-Z]:\\.*?AssembleeGameClient[0-9]*\.swf)$");
        If @error or $result == 0 Then _error("Invalid client provided: " & $config.Item("client") & @CRLF & @CRLF & "If the value is correct then try disabling param security in the au3 file config.")
    EndIf

    $pid = Run($config.Item("path") & " " & $config.Item("client"))

    If $pid > 0 And Not($config.Item("title") == "" Or $config.Item("title") == "false") Then
        Local $name = $config.Item("title")
        If Not($config.Item("ign") == "") Then
            $name &= " - " & $config.Item("ign")
        EndIf
        Local $win = _ProcessGetHWnd($pid)
        WinSetTitle($win, "", $name)
    EndIf

Else

    MsgBox(0, "Error", "Invalid mode provided. Valid modes are: browser, flash")

EndIf

;;
;; Are you looking to customize your One Click Login? This new version can be customized in Muledump!
;; Check out the wiki for more information: https://github.com/jakcodex/muledump/wiki/One-Click-Login
;;
;; Don't want to customize in Muledump? Head up to the top of the file to modify the configuration.
;;
