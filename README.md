# ticket-service
##Установка
```
#!bash
git clone https://.git
npm install
npm run wp-build
```

##Запуск сервиса
```
#!bash
npm start
```

##Дополнительные надстройки окружения для отладки
Настройки позволяют отображать в консоли следующие логи:
* SQL запросы вкл/откл
  ```
  #!bash
  set SQL_QUERY=show
  set SQL_QUERY=hide
  ```
* SQL ответы вкл/откл
  ```
  #!bash
  set SQL_DATA=show
  set SQL_DATA=hide
  ```

Нужно помнить, настройки среды окружения хранятся только в одной сессии, это значит если вы закрыли консоль, то все настройки сбросятся. Так же они не влияют на другие запущенные экземпляры node.js.

## Конфигурация домена
Конфигурация для работы с доменом short.kz и перенаправление с порта 80 на 3000

####Windows host
В файл `\Windows\System32\drivers\etc\host`, внесите следующую строчку:
```
#!bash
127.0.0.1	short.kz
```

####Router config (Windows)
В консоле:
```
#!bash
netsh interface portproxy add v4tov4 listenport=80 listenaddress=short.kz connectaddress=actmill.kz connectport=3000 protocol=tcp
```