### 介绍
---
- JWonder核心使用全局对象JWonder进行访问，也可简化为$符，为了保持与Jquery的兼容，当Jquery被加载时，核心对象简化使用 $ 。
- 如果要让JWonder和JQuery混用，请让JWonder的加载时间晚于JQuery加载。a

### 使用说明书（方法）
---
1. addLoad()
> 说明：页面初始化执行的Load
2. each()
> 说明：合并枚举多个对象和列表
3. eachLis()
> 说明：枚举一个列表
4. eachObj()
> 说明：枚举一个对象的属性
5. eval()
> 说明：求解Javascript表达式字符串
6. exception()
> 说明：触发一个自定义异常
7. isDef()
> 说明：判断变量是否定义
8. isNull()
> 说明：判断变量是否为空
9. listarg()
> 说明：整理合并多个对象和列表为一个列表
10. loop()
> 说明：执行循环惰性求值
11. range()
> 说明：构造一个整数范围迭代器
12. shallowCopy()
> 说明：对对象执行浅拷贝
13. addCommand()
> 说明：(语法移植API）向命令函数列表内添加一个新的项目
14. filter()
> 说明：(语法移植API）匹配传入命令对象，触发一个命令函数执行

### 属性
---
1. Client
> 说明：浏览器信息
2. wonderTag
>说明：对象的唯一类型标识
