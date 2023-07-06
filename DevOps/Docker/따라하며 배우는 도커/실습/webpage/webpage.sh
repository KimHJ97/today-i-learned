#!/bin/bash
mkdir /htdocs
while :
do
    /user/games/fortune > /htdocs/index.html
    sleep 10
done