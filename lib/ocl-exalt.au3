;;
;; One Click Login v3
;; + ROTMG Exalt
;; + https://github.com/jakcodex/muledump/wiki/One+Click+Login for more information
;;
;; If configuring via Muledump then you don't need to change anything in this file.
;; Be sure to run the script with AutoIt and choose "reinstall" if prompted.
;;

Global $config = ObjCreate("Scripting.Dictionary")

;;  path to RotMG Exalt.exe
$config.Add("path", "%USERPROFILE%\Documents\RealmOfTheMadGod\Production\RotMG Exalt.exe");

;;  ocl operational mode (only 'exalt' is supported in ocl v3)
$config.Add("mode", "exalt");

;;  account username
$config.Add("username", "jakcodex-ocl-exalt-misconfigured");

;;  account password
$config.Add("password", "");

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

;;  default window title
$config.Add("title", "Muledump One Click Login")

;;  account ign (included by request)
$config.Add("ign", "");

#include <String.au3>
#include <File.au3>
#include <Array.au3>
#include <Crypt.au3>

Global $string, $password, $username, $data, $path, $search, $file, $root
$root = "HKEY_CLASSES_ROOT\muledump"
$title = "Muledump One Click Login Exalt Installer"
$adminRightsError = "Error - Requires Admin Privileges" & @CRLF & @CRLF & "Either edit ocl-exalt.au3 in a text editor and set 'admin' to true in the config or update your request parameters" & @CRLF & @CRLF & "For more help see:" & @CRLF & "https://github.com/jakcodex/muledump/wiki/One-Click-Login"

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

Func _write($update = False)
	$clientToken = _ComputeClientToken()
	RegWrite($root,"","REG_SZ","URL: muledump Protocol")
	RegWrite($root,"URL Protocol","REG_SZ","")
	RegWrite($root & "\shell")
	RegWrite($root & "\shell\open")
	RegWrite($root & "\shell\open\command","","REG_SZ", @AutoItExe & ' "' & @ScriptFullPath & '" %1 ' & $clientToken)
	If RegRead("HKEY_CLASSES_ROOT\muledump","") Then
		If $update Then
			MsgBox(64,$title,"One Click Login Exalt successfully updated")
			ShellExecute(@AutoItExe, $CmdLineRaw & " " & $clientToken)
			ProcessClose(@AutoItPID)
		Else
			MsgBox(64,$title,"One Click Login Exalt: installed" & @CRLF & @CRLF & "Now go to Muledump and click Setup > Settings > One Click Login to finish setup")
		EndIf
	Else
		MsgBox(16,$title,$adminRightsError)
	EndIf
	Exit
EndFunc

Func _install($update = False)
    $config.Item('admin') = 'true';
    _GetAdminRights()
	Local $k
	$k = RegEnumKey($root, 1)
	If @error == 2 Then
		MsgBox(16,$title,$adminRightsError)
		Exit
	EndIf
	If @error == 1 Or $update Then _write($update)
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

Func _Base64Encode($sData)
    Local $oXml = ObjCreate("Msxml2.DOMDocument")
    If Not IsObj($oXml) Then
        SetError(1, 1, 0)
    EndIf

    Local $oElement = $oXml.createElement("b64")
    If Not IsObj($oElement) Then
        SetError(2, 2, 0)
    EndIf

    $oElement.dataType = "bin.base64"
    $oElement.nodeTypedValue = Binary($sData)
    Local $sReturn = $oElement.Text

    If StringLen($sReturn) = 0 Then
        SetError(3, 3, 0)
    EndIf

    Return $sReturn
EndFunc   ;==>_Base64Encode

Func _POST($url, $data)
    Local $req = ObjCreate("WinHttp.WinHttpRequest.5.1")
    ; $req.SetProxy(2, "http://localhost:8866") ; fiddler
    $req.Open("POST", $url, False)
    $req.SetRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    $req.Send($data)
    Return $req.ResponseText
EndFunc   ;==>_POST

; https://www.autoitscript.com/forum/topic/95850-url-encoding/?tab=comments#comment-689045
Func _URLEncode($urlText)
    $url = ""
    For $i = 1 To StringLen($urlText)
        $acode = Asc(StringMid($urlText, $i, 1))
        Select
            Case ($acode >= 48 And $acode <= 57) Or _
                    ($acode >= 65 And $acode <= 90) Or _
                    ($acode >= 97 And $acode <= 122)
                $url = $url & StringMid($urlText, $i, 1)
            Case $acode = 32
                $url = $url & "+"
            Case Else
                $url = $url & "%" & Hex($acode, 2)
        EndSelect
    Next
    Return $url
EndFunc   ;==>_URLEncode

Func _ComputeClientToken()
    $hash = _ComputeClientTokenNew()
    If $hash = "" Then
        $hash = _ComputeClientTokenOld()
        If $hash = "" Then
            MsgBox(16,$title,"Installation failed." & @CRLF & "Could not calculate HWID." & @CRLF & "Ask Altafen for assistance.")
            Exit
        EndIf
    EndIf
    Return $hash
EndFunc   ;==>_ComputeClientToken

Func _ComputeClientTokenNew()
    $wmi = ObjGet("winmgmts:{impersonationLevel=Impersonate}!\\.\root\cimv2")
    If IsObj($wmi) Then
        $serials = ""
        $result = $wmi.ExecQuery("SELECT SerialNumber FROM Win32_BaseBoard", "WQL")
        For $item In $result
            $serials = $serials & $item.SerialNumber
        Next
        $result = $wmi.ExecQuery("SELECT SerialNumber FROM Win32_BIOS", "WQL")
        For $item In $result
            $serials = $serials & $item.SerialNumber
        Next
        $result = $wmi.ExecQuery("SELECT SerialNumber FROM Win32_OperatingSystem", "WQL")
        For $item In $result
            $serials = $serials & $item.SerialNumber
        Next
        $hash = _Crypt_HashData($serials, $CALG_SHA1)
        Return StringLower(StringMid($hash, 3))
    Else
        Return ""
    EndIf
EndFunc   ;==>_ComputeClientTokenNew

Func _ComputeClientTokenOld()
    $ps1 = _TempFile(@TempDir, "~", ".ps1")
    $txt = _TempFile(@TempDir, "~", ".txt")
    FileWrite($ps1, '' & _
        '$stringAsStream = [System.IO.MemoryStream]::new()' & @CRLF & _
        '$writer = [System.IO.StreamWriter]::new($stringAsStream)' & @CRLF & _
        '$writer.write("$(Get-CimInstance -ClassName Win32_BaseBoard | foreach {$_.SerialNumber})$(Get-CimInstance -ClassName Win32_BIOS | foreach {$_.SerialNumber})$(Get-CimInstance -ClassName Win32_OperatingSystem | foreach {$_.SerialNumber})")' & @CRLF & _
        '$writer.Flush()' & @CRLF & _
        '$stringAsStream.Position = 0' & @CRLF & _
        'echo "$(Get-FileHash -InputStream $stringAsStream -Algorithm SHA1 | foreach {$_.Hash})".ToLower() > ' & $txt & @CRLF)
    RunWait('PowerShell.exe -ExecutionPolicy Bypass -Command "' & $ps1 & '"', "", @SW_HIDE)
    $clientToken = FileRead($txt)
    FileDelete($ps1)
    FileDelete($txt)
    Return StringStripWS($clientToken, $STR_STRIPALL)
EndFunc   ;==>_ComputeClientTokenOld

Func _GetLoginData($guid, $password, $clientToken)
    $verify_url = "https://www.realmofthemadgod.com/account/verify"
    $verify_data = _
        "guid=" & _URLEncode($guid) & _
        "&password=" & _URLEncode($password) & _
        "&clientToken=" & $clientToken
    $verify_resp = _POST($verify_url, $verify_data)

    $accessToken = StringRegExp($verify_resp, "<AccessToken>(.+)</AccessToken>", $STR_REGEXPARRAYMATCH)
    If @error Then
        MsgBox(0, "Muledump", "Error while logging in:" & @CRLF & $verify_resp)
        Exit
    EndIf
    $tokenTimestamp = StringRegExp($verify_resp, "<AccessTokenTimestamp>(.+)</AccessTokenTimestamp>", $STR_REGEXPARRAYMATCH)
    If @error Then
        MsgBox(0, "Muledump", "Error while logging in:" & @CRLF & $verify_resp)
        Exit
    EndIf
    $tokenExpiration = StringRegExp($verify_resp, "<AccessTokenExpiration>(.+)</AccessTokenExpiration>", $STR_REGEXPARRAYMATCH)
    If @error Then
        MsgBox(0, "Muledump", "Error while logging in:" & @CRLF & $verify_resp)
        Exit
    EndIf

    $vATC_url = "https://www.realmofthemadgod.com/account/verifyAccessTokenClient"
    $vATC_data = _
        "clientToken=" & $clientToken & _
        "&accessToken=" & _URLEncode($accessToken[0])
    $vATC_resp = _POST($vATC_url, $vATC_data)

    $login_data = "data:{platform:Deca" & _
        ",guid:" & _Base64Encode($guid) & _
        ",token:" & _Base64Encode($accessToken[0]) & _
        ",tokenTimestamp:" & _Base64Encode($tokenTimestamp[0]) & _
        ",tokenExpiration:" & _Base64Encode($tokenExpiration[0]) & _
        ",env:4}"
    Return StringStripWS($login_data, $STR_STRIPALL)
EndFunc   ;==>_GetLoginData

If $CmdLine[0] = 0 Then _install()
If $CmdLine[0] = 1 Then
    $k = MsgBox(1, $title, "Due to an update to Exalt, OCL must reinstall itself.")
    If $k == 1 Then _install(True)
EndIf

;;  process the command input
$data = StringReplace($CmdLine[1],"muledump:","")
$data = StringSplit($data,"-")
$username = _HexToString($data[1])
$password = _HexToString($data[2])

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

                    If $config.Item("paramsecurity") == "true" and $paramPieces[1] == "admin" and $config.Item("adminparams") == "false" Then ContinueLoop
                    If $paramPieces[2] == "" Then ContinueLoop

                    $config.Item($paramPieces[1]) = $paramPieces[2]
                    $config.Item($paramPieces[1]) = StringReplace($config.Item($paramPieces[1]), "%5C", "\")
                    $config.Item($paramPieces[1]) = StringReplace($config.Item($paramPieces[1]), "%2F", "/")
                    $config.Item($paramPieces[1]) = StringReplace($config.Item($paramPieces[1]), "%20", " ")

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

;;
; launch one-click login
;;

Global $pid = 0
If $config.Item("mode") == "exalt" Then

    If $config.Item("params") == "true" and $config.Item("paramsecurity") == "true" Then

        Local $result

        ;;  the exe has a particular filename
        $result = StringRegExp($config.Item("path"), "^[a-zA-Z]:\\[a-zA-Z0-9-_\\]*?RotMG Exalt\.exe$");
        If @error or $result == 0 Then _error("Invalid path provided: " & $config.Item("path") & @CRLF & @CRLF & "If the value is correct then try disabling param security in the au3 file config.")

        ;;  username should be valid base64
;;        $result = StringRegExp($username, "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$");
;;        If @error or $result == 0 Then _error("Invalid username provided. " & @CRLF & @CRLF & "If the value is correct then try disabling param security in the au3 file config.")

        ;;  password should be valid base64
;;        $result = StringRegExp($password, "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$");
;;        If @error or $result == 0 Then _error("Invalid password provided. " & @CRLF & @CRLF & "If the value is correct then try disabling param security in the au3 file config.")

    EndIf

    $args = _GetLoginData($username, $password, $CmdLine[2])
    $pid = ShellExecute($config.Item("path"), $args)

    If $pid > 0 And Not($config.Item("title") == "" Or $config.Item("title") == "false") Then
        Local $name = $config.Item("title")
        If Not($config.Item("ign") == "") Then
            $name &= " - " & $config.Item("ign")
        EndIf
        Local $win = _ProcessGetHWnd($pid)
        WinSetTitle($win, "", $name)
    Else
        If $config.Item("debug") == "true" Then
            MsgBox(0, "Error", "Failed to launch game client")
        EndIf
    EndIf

Else

    MsgBox(0, "Error", "Invalid mode provided. Valid modes are: exalt")

EndIf

;;
;; Are you looking to customize your One Click Login? This new version can be customized in Muledump!
;; Check out the wiki for more information: https://github.com/jakcodex/muledump/wiki/One-Click-Login
;;
;; Don't want to customize in Muledump? Head up to the top of the file to modify the configuration.
;;
