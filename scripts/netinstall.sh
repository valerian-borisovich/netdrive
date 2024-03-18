#!/bin/bash

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

echo "+============================================================+"
echo "|                    NetDrive Installer                  |"
echo "|                                                            |"
echo "|                                         <valerian-borisovich@gmail.com> |"
echo "|------------------------------------------------------------|"
echo "|                                         https://valerian-borisovich.github.io |"
echo "+============================================================+"
echo ""

echo -e "\n|  NetDrive is installing ... "


echo -e "|\n|  Download NetDrive Package ... "
wget -O netdrive-main.zip https://github.com/valerian-borisovich/netdrive/archive/refs/heads/master.zip >/dev/null 2>&1

unzip -q -o netdrive-main.zip -d ./

mv netdrive-main netdrive
rm -f netdrive-main.zip

cd netdrive
echo -e "|\n|  Install Dependents ... "
npm install yarn -g >/dev/null 2>&1
npm install pm2 -g >/dev/null 2>&1

yarn install >/dev/null 2>&1
yarn build-web
mkdir -p ./packages/netdrive/theme/default
mkdir -p ./packages/netdrive/plugins
cp -r ./packages/netdrive-web/dist/* ./packages/netdrive/theme/default
cp -r ./packages/netdrive-plugin/lib/* ./packages/netdrive/plugins
cd packages/netdrive

pm2 start app.js --name netdrive-next >/dev/null 2>&1
pm2 save >/dev/null 2>&1
pm2 startup >/dev/null 2>&1

echo -e "|\n|  Success: NetDrive has been installed\n"