@echo off

cd\
cd D:\suddenQuake\mapping\working


echo Copying Files...
copy D:\suddenQuake\id1\maps\unnamed.map D:\suddenQuake\mapping\working


echo Converting map...


echo --------------QBSP--------------
D:\suddenQuake\mapping\ericw-tools-v0.18.1-32-g6660c5f-win64\bin\qbsp.exe unnamed

echo --------------VIS---------------
D:\suddenQuake\mapping\ericw-tools-v0.18.1-32-g6660c5f-win64\bin\vis.exe unnamed

echo -------------LIGHT--------------
D:\suddenQuake\mapping\ericw-tools-v0.18.1-32-g6660c5f-win64\bin\light.exe unnamed

copy unnamed.bsp D:\suddenQuake\id1\maps
copy unnamed.pts D:\suddenQuake\id1\maps
copy unnamed.lit D:\suddenQuake\id1\maps
pause
