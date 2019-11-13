set indexPath=.\node_modules\@chartiq\finsemble-electron-adapter\startup\devIndex.js
set electronPath=.\node_modules\.bin\electron
set debugArg=--remote-debugging-port=9090 --inspect=5858
set manifest=http://localhost:3375/configs/openfin/manifest-local.json

set ELECTRON_DEV=true
set NODE_ENV=development
node ./server/server.js

%electronPath% %indexPath% %debugArg% --manifest %manifest%
