# One Click Login

Configure and manage One Click Login. Profiles can be set to use browser or Flash projector, prod or testing servers, and configurable per-account.

See <a href="https://github.com/jakcodex/muledump/wiki/One-Click-Login" target="_blank">One Click Login</a> in the wiki for setup instructions and additional information.

### One Click Login Enabled

Enable or disable the generation of One Click Login links.

### Copy Links

When enabled, OCL links will be able to be copied from the user interface. When disabled, OCL links are generated when clicked and then erased. 

Enabling Copy Links has the drawback that the username and password for each account will be findable in the page source.

## Profile Editor

### Profile Name

The name you want to use for this profile.

### Is Default

The default profile is used when an OCL link is clicked and no other profile is chosen for the account.

### Mode

1. Browser
1. Flash Projector - <a href="https://www.adobe.com/support/flashplayer/debug_downloads.html" target="_blank">Flash Player projector on Adobe.com</a>

### Path

1. Browser Mode
   - Game web page URL (default: https://www.realmofthemadgod.com/)
1. Flash Projector
   - Path to downloaded Flash Projector exe file (e.g. C:\Users\Owner\Downloads\flashplayer_16_sa.exe)
   
### Game Client

Only for use with Flash Projector mode. This is the path to the game SWF file (default: https://www.realmofthemadgod.com/client)

### Custom Window Title

*Flash Projector Only* - Set the game client window title to a custom value.

Set to `false` to disable changing the default window title.

### Include Account Name

*Flash Projector Only* - Whether or not to include the account's guid or IGN in the link

### Use Admin Privileges

OCL will request admin privileges before executing. If you're getting errors about needing admin privileges then enable this.

When enabled, Windows UAC will prompt for authorization every time you click an OCL link.

### Update Paths

Optional; restricts OCL to updating RotMG.sol files for only specific hostnames.

## Note About Testing Server

If you set a profile that utilizes `www.realmofthemadgod.com` to a testing account, it will automatically switch to `test.realmofthemadgod.com` without needing to create a new, testing-specific OCL profile.  
 