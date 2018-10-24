#!/bin/sh
if [ -z "$1" ];
then
	echo "no se especifico entorno por defecto deploya a test"
        MY_ENV=test ionic cordova run android
else
 case "$1" in
    "test")
        echo "matched - test"
	MY_ENV="$1" ionic cordova run android
        ;;
    "preprod")
        echo "matched - preprod"
	MY_ENV="$1" ionic cordova run android
        ;;
    "prod")
        echo "matched - prod"
	MY_ENV="$1" ionic cordova run android --prod
        ;;
    *)
        echo "variable de entorno desconocida probar con test,preprod o prod"
        ;;
 esac
fi



