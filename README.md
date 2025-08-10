# 🎵 SongForge

**The Ultimate Web App for Artists' Track Creation Process**

SongForge is a comprehensive, browser-based application designed specifically for singers, rappers, producers, and music creators to document, manage, and execute every step of their track creation journey.

|---#---#---#---#---|
|-- SETUP GUIDE -- -|
|---#---@----@--#-- |

		>>		git clone https://github.com/gitgodev/SongForge.git
   	>>		cd SongForge



# Using Python
						python -m http.server 8000

# Using Node.js
						npx serve .

# Or open index.html in your browser
						Open your browser and navigate to http://localhost:8000



YOU MIGHT NEED TO INSTALL GIT CLIENT.    IN POWERSHELL: 


# get latest download url for git-for-windows 64-bit exe
$git_url = "https://api.github.com/repos/git-for-windows/git/releases/latest"
$asset = Invoke-RestMethod -Method Get -Uri $git_url | % assets | where name -like "*64-bit.exe"
# download installer
$installer = "$env:temp\$($asset.name)"
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $installer
# run installer
$git_install_inf = "<install inf file>"
$install_args = "/SP- /VERYSILENT /SUPPRESSMSGBOXES /NOCANCEL /NORESTART /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS /LOADINF=""$git_install_inf"""
Start-Process -FilePath $installer -ArgumentList $install_args -Wait



   


 Features

### 🎯 **Complete Workflow Management**
- Customizable checklist covering the entire track lifecycle
- Progress tracking from idea to release
- Custom step creation and note-taking

### ✍️ **Advanced Lyrics Editor**
- Rich-text lyrics editing with section organization
- AI-powered writing assistance and rhyme suggestions
- Drag-and-drop section reordering
- Export lyrics in multiple formats (TXT, Markdown)

### 🎧 **Audio Recording & Import**
- Drag-and-drop beat file import (MP3, WAV, OGG)
- Built-in vocal recording with microphone access
- Simple audio mixer with volume controls
- Multiple recording takes and playback

### 🎨 **Artwork Creation**
- Manual artwork upload with size validation
- AI-powered artwork generation
- Industry-standard guidelines (3000x3000px, square ratio)
- Template guidance for professional releases

### 🚀 **Release Planning**
- Comprehensive release preparation checklist
- Distribution platform recommendations
- Deadline tracking and progress monitoring
- Pre-save campaign guidance

### 🤖 **AI Assistant Integration**
- Powered by Poe AI platform
- Lyric writing assistance and improvements
- Rhyme and synonym suggestions
- Creative brainstorming support
- Artwork generation from text descriptions



