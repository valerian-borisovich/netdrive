# Установка
Netdrive поддерживает несколько методов установки.

## Docker
```bash
docker run -d -v /etc/netdrive:/netdrive/cache -p 33001:33001 --name="netdrive" valerian-borisovich/netdrive
```

## Бинарная версия
[releases](https://github.com/valerian-borisovich/netdrive/releases)

## Установка завершена
Откройте в веб браузере адрес [localhost:33001](http://localhost:33001) и попадёте в интерфейс по умолчанию.
По адресу [localhost:33001/@manage](http://localhost:33001/@manage) находится панель управление, пароль по умолчанию - ```netdrive```.
