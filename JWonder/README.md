#前端开发库（JWonder）

<h2>简介</h2>
JWonder核心使用全局对象<code>_JWonder</code>进行访问，也可简化为<code>$</code>符，为了保持与Jquery的兼容，当Jquery被加载时，核心对象简化使用<code> _$ </code>。<br>
如果要让JWonder和JQuery混用，请让JWonder的加载时间晚于JQuery加载。

<h2> 接口文档 </h2>
1、导出方法 <br>
1-1：<code>addLoad()</code> <br>
说明：页面初始化执行的Load <br>
1-2：<code>each()</code> <br>
说明：合并枚举多个对象和列表 <br>
1-3：<code>eachLis()</code> <br>
说明：枚举一个列表 <br>
1-4：<code>eachObj()</code> <br>
说明：枚举一个对象的属性 <br>
1-5：<code>eval()</code> <br>
说明：求解Javascript表达式字符串 <br>
1-6：<code>exception()</code> <br>
说明：触发一个自定义异常 <br>
1-7：<code>isDef()</code> <br>
说明：判断变量是否定义 <br>
1-8：<code>isNull()</code> <br>
说明：判断变量是否为空 <br>
1-9：<code>listarg()</code> <br>
说明：整理合并多个对象和列表为一个列表 <br>
1-10：<code>loop()</code> <br>
说明：执行循环惰性求值 <br>
1-11：<code>range()</code> <br>
说明：构造一个整数范围迭代器 <br>
1-12：<code>shallowCopy()</code> <br>
说明：对对象执行浅拷贝 <br>
1-13：<code>_addCommand_()</code> <br>
说明：(语法移植API）向命令函数列表内添加一个新的项目 <br>
1-14：<code>_filter_()</code> <br>
说明：(语法移植API）匹配传入命令对象，触发一个命令函数执行 <br>

2、属性 <br>
2-1：<code>Client</code> <br>
说明：浏览器信息 <br>
2-2：<code>wonderTag</code> <br>
说明：对象的唯一类型标识 <br>

<h2>备注</h2>
详细的使用方法请参考：readme.html

<h2>License</h2>
The JavaScript JWonder script is released under the MIT license.
