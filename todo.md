# 接口文档

后端地址：localhost:8080/

## 登录接口

地址：/login

请求格式：post

```
{
    "username":"admin",
    "password":"123"
}
```

返回示例：

```
{
    "msg": "success",
    "code": 1,
    "data": {
        "id": 1,
        "username": "admin",
        "token": "eyJhbGciOiJIUzM4NCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc4MzQxMzUyOSwiZXhwIjoxNzgzNDU2NzI5fQ.f-OSQS7zEGird6V3INt3gxWsww5a0OZdA6RSolzbE91lcRbZaM5CM1XxABfgKzBL"
    }
}
```

## item接口

地址：/item

该接口需要带上请求头'Authorization: Bearer <token>

### get请求全部

参数：

- string type（类型）(非必须)
- integer pageNum   (非必须)
- integer pageSize   (非必须)

返回示例： 

```
{
    "msg": "success",
    "code": 1,
    "data": {
        "records": [
            {
                "id": 13,
                "userId": 1,
                "type": "game",
                "title": "stranova",
                "description": "卡拉比丘似了喵",
                "rating": null,
                "status": "planned",
                "createdAt": "2026-07-07T14:37:43",
                "updatedAt": "2026-07-07T14:37:43"
            },
            {
                "id": 12,
                "userId": 1,
                "type": "game",
                "title": "stranova",
                "description": "卡拉比丘似了喵",
                "rating": null,
                "status": "planned",
                "createdAt": "2026-07-07T14:37:02",
                "updatedAt": "2026-07-07T14:37:02"
            },
            {
                "id": 11,
                "userId": 1,
                "type": "game",
                "title": "stranova",
                "description": "卡拉比丘似了喵",
                "rating": null,
                "status": "planned",
                "createdAt": "2026-07-07T14:36:28",
                "updatedAt": "2026-07-07T14:36:28"
            },
            {
                "id": 10,
                "userId": 1,
                "type": "game",
                "title": "stranova",
                "description": "卡拉比丘似了喵",
                "rating": null,
                "status": "planned",
                "createdAt": "2026-07-07T14:35:23",
                "updatedAt": "2026-07-07T14:35:23"
            },
            {
                "id": 9,
                "userId": 1,
                "type": "game",
                "title": "stranova",
                "description": "卡拉比丘似了喵",
                "rating": null,
                "status": "doing",
                "createdAt": "2026-07-07T14:26:15",
                "updatedAt": "2026-07-07T15:55:26"
            },
            {
                "id": 8,
                "userId": 1,
                "type": "game",
                "title": "战地6",
                "description": "卡拉比丘似了喵",
                "rating": 9,
                "status": "planned",
                "createdAt": "2026-07-07T10:19:52",
                "updatedAt": "2026-07-07T15:56:53"
            },
            {
                "id": 1,
                "userId": 1,
                "type": "book",
                "title": "魔女之旅",
                "description": "1",
                "rating": null,
                "status": "planned",
                "createdAt": "2026-07-07T09:08:11",
                "updatedAt": "2026-07-07T09:08:11"
            }
        ],
        "total": 7,
        "size": 10,
        "current": 1,
        "pages": 1
    }
}
```

### get单条请求

curl --location --request GET 'http://localhost:8080/item/1' \
返回示例：

```
{"msg":"success","code":1,"data":{"id":1,"userId":1,"type":"book","title":"魔女之旅","description":"1","rating":null,"status":"planned","createdAt":"2026-07-07T09:08:11","updatedAt":"2026-07-07T09:08:11"}}
```

### post

参数示例：

```
{
    "type":"game",          （必须）
    "title":"stranova",		（必须）
    "description":"卡拉比丘似了喵",   （可选）
    "status":"planned"       （自动为planned）
}
```

返回示例：

```
{"msg":"success","code":1,"data":null}
```

### Delete

参数：

```
[4,5,6,7]     数组删除
```

返回示例：

```
{"msg":"success","code":1,"data":null}
```

### put

参数：

```
{
    "id":"8",           （必须）
    "title":"战地6"		（必须）
}   title、type、description、rating、status选一个
```

## TimeLineEvent接口

地址：/timelineEvent

该接口需要带上请求头'Authorization: Bearer <token>

### get

参数	类型	必填	说明
itemId	Long	否	按 Item 筛选
eventType	String	否	按事件类型筛选（如 CREATE_ITEM、RATE_ITEM）
startDate	Date	否	开始日期（ISO 格式：2026-07-01）
endDate	Date	否	结束日期（包含当天）
pageNum	Integer	否	页码，默认 1
pageSize	Integer	否	每页条数，默认 10



返回示例：

```
{"msg":"success","code":1,"data":{"records":[{"id":4,"userId":1,"itemId":8,"eventType":"RATE_ITEM","description":"评分: 1 → 9","eventData":null,"createdAt":"2026-07-07T15:56:53"},{"id":3,"userId":1,"itemId":9,"eventType":"START_ITEM","description":"状态: planned → doing","eventData":null,"createdAt":"2026-07-07T15:55:26"},{"id":2,"userId":1,"itemId":8,"eventType":"RATE_ITEM","description":"评分: null → 1","eventData":null,"createdAt":"2026-07-07T15:53:17"},{"id":1,"userId":1,"itemId":13,"eventType":"CREATE_ITEM","description":"stranova","eventData":null,"createdAt":"2026-07-07T14:37:43"}],"total":4,"size":10,"current":1,"pages":1}}
```



---------------------

# 路由：

登录/login
仪表盘/dashboard
时间线/timeline
项目/items/:item
设置/settings

默认进入login

----------

# 布局设计

结构:

```
Nav|sidebar
   |RouterView
```

sidebar负责导航

-------

# 项目结构

```
src/

api/
assets/
components/
layouts/
router/
stores/
utils/
views/

App.vue
main.js
```

--------------

**# 性能设计**

优化：

```
路由懒加载
图片懒加载
keep-alive
分页加载
组件按需加载
```

