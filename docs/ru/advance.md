## Установка пароля для папки
Создайте новый файл с именем ```.passwd``` в папке которую необходимо защитить.
В файле запишите следующие параметры:
```type``` метод проверки пароля
```data``` пароли

пример файла .passwd：
```yaml
type: basic
data:
  - 123456
  - abcdef
``` 

Вы можете использовать пароль ```123456```, ```abcdef``` для проверки.

***

## Получить идентификатор папки
Продолжайте входить в систему в фоновом режиме, вернитесь к списку домашней страницы и нажмите "!" после папки. 
С помощью кнопки можно просмотреть идентификатор папки.

***

## Обратный прокси-сервер Nginx
При использовании обратной генерации, пожалуйста, добавьте следующую конфигурацию.

#### Nginx  
```ini 
  proxy_set_header Host  $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;

  proxy_set_header Range $http_range;
  proxy_set_header If-Range $http_if_range;
  proxy_no_cache $http_range $http_if_range;
```   

Если вы используете функцию загрузки, пожалуйста, установите ограничение на размер загружаемого файла nginx.   
```
  client_max_body_size 8000m;
```   
