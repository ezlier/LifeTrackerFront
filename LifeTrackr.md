---
title: 默认模块
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# 默认模块

Base URLs:

# Authentication

# 登录接口

## POST 登录

POST /login

> Body 请求参数

```json
{
    "username":"admin",
    "password":"123"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 是 |none|

> 返回示例

> 200 Response

```json
{"msg":"Login failed","code":0,"data":null}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

# item

## GET 拿数据

GET /item

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|type|query|string| 否 |none|
|pageNum|query|integer| 否 |none|
|pageSize|query|integer| 否 |none|
|Authorization|header|string| 否 |none|

> 返回示例

> 200 Response

```json
{"msg":"success","code":1,"data":{"records":[],"total":0,"size":10,"current":1,"pages":0}}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## POST 创建项目

POST /item

> Body 请求参数

```json
{
    "type":"game",
    "title":"stranova",

    "description":"卡拉比丘似了喵",

    "status":"planned" 
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|
|body|body|object| 是 |none|

> 返回示例

> 200 Response

```json
{"msg":"success","code":1,"data":null}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## DELETE 删除项目

DELETE /item

> Body 请求参数

```json
[4,5,6,7]
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|
|body|body|object| 是 |none|

> 返回示例

> 200 Response

```json
{"msg":"success","code":1,"data":null}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## PUT 更新项目

PUT /item

> Body 请求参数

```json
{
    "id":"8",
    "title":"战地6"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|
|body|body|object| 是 |none|

> 返回示例

> 200 Response

```json
{"msg":"success","code":1,"data":null}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## GET 拿单条数据

GET /item/1

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 是 |none|

> 返回示例

```json
{"msg":"success","code":1,"data":{"id":1,"userId":1,"type":"book","title":"魔女之旅","description":"1","rating":null,"status":"planned","createdAt":"2026-07-07T09:08:11","updatedAt":"2026-07-07T09:08:11"}}
```

```json
{"msg":"success","code":1,"data":{"id":1,"userId":1,"type":"book","title":"魔女之旅","description":"1","rating":null,"status":"planned","createdAt":"2026-07-07T09:08:11","updatedAt":"2026-07-07T09:08:11"}}
```

```json
{"msg":"success","code":1,"data":{"id":1,"userId":1,"type":"book","title":"魔女之旅","description":"1","rating":null,"status":"planned","createdAt":"2026-07-07T09:08:11","updatedAt":"2026-07-07T09:08:11"}}
```

```json
{"msg":"success","code":1,"data":{"id":1,"userId":1,"type":"book","title":"魔女之旅","description":"1","rating":null,"status":"planned","createdAt":"2026-07-07T09:08:11","updatedAt":"2026-07-07T09:08:11"}}
```

```json
{"msg":"success","code":1,"data":{"id":1,"userId":1,"type":"book","title":"魔女之旅","description":"1","rating":null,"status":"planned","createdAt":"2026-07-07T09:08:11","updatedAt":"2026-07-07T09:08:11"}}
```

```json
{"msg":"success","code":1,"data":{"id":1,"userId":1,"type":"book","title":"魔女之旅","description":"1","rating":null,"status":"planned","createdAt":"2026-07-07T09:08:11","updatedAt":"2026-07-07T09:08:11"}}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

# TimeLineEvent

## GET 获取用户事件

GET /timelineEvent

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|

> 返回示例

> 200 Response

```json
{"msg":"success","code":1,"data":{"records":[{"id":4,"userId":1,"itemId":8,"eventType":"RATE_ITEM","description":"评分: 1 → 9","eventData":null,"createdAt":"2026-07-07T15:56:53"},{"id":3,"userId":1,"itemId":9,"eventType":"START_ITEM","description":"状态: planned → doing","eventData":null,"createdAt":"2026-07-07T15:55:26"},{"id":2,"userId":1,"itemId":8,"eventType":"RATE_ITEM","description":"评分: null → 1","eventData":null,"createdAt":"2026-07-07T15:53:17"},{"id":1,"userId":1,"itemId":13,"eventType":"CREATE_ITEM","description":"stranova","eventData":null,"createdAt":"2026-07-07T14:37:43"}],"total":4,"size":10,"current":1,"pages":1}}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

# 数据模型

