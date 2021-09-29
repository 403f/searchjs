# searchjs
So short! So powerful! So flexible! You can use the library to filter data easily. And it's very flexible,You can design the chain style which you want.And it's robust,you can change the order of chain-unction as well it's not get error.

#example
```
<script src="./search.js"></script>
var data = [
{'userId':132,title:'dads'},
{'userId':1312,title:'ddsadads'},
{'userId':12,title:'daddasdass'},
{'userId':1,title:'hghhfg'},
];

var result = findData(data)
      .filter(true,[
				'userId','title',
			])
      .where({
				'userId':[
					'>=',11
				]
			})
      .orderBy('userId','desc');
			
for(let i = 0; i < result.length; i++) {
		//Log.fire('none','accept',JSON.stringify(result[i]));
    console.log(result[i]);
}
```

you can change the order,for example:

```
<script src="./search.js"></script>
var data = [
{'userId':132,title:'dads'},
{'userId':1312,title:'ddsadads'},
{'userId':12,title:'daddasdass'},
{'userId':1,title:'hghhfg'},
];

var result = findData(data)
      .filter(true,[
				'userId','title',
			])
      .orderBy('userId','desc')
      .where({
				'userId':[
					'>=',11
				]
			});
			
for(let i = 0; i < result.length; i++) {
		//Log.fire('none','accept',JSON.stringify(result[i]));
    console.log(result[i]);
}
```
you also can del the filter function in anyway by anymethod,for example:
```
<script src="./search.js"></script>
var data = [
{'userId':132,title:'dads'},
{'userId':1312,title:'ddsadads'},
{'userId':12,title:'daddasdass'},
{'userId':1,title:'hghhfg'},
];

var result = findData(data)
      .filter(true,[
				'userId','title',
			])
      .orderBy('userId','desc')
      ;
			
for(let i = 0; i < result.length; i++) {
		//Log.fire('none','accept',JSON.stringify(result[i]));
    console.log(result[i]);
}
```
```
<script src="./search.js"></script>
var data = [
{'userId':132,title:'dads'},
{'userId':1312,title:'ddsadads'},
{'userId':12,title:'daddasdass'},
{'userId':1,title:'hghhfg'},
];

var result = findData(data)
      .filter(true,[
				'userId','title',
			])
      .where({
				'userId':[
					'>=',11
				]
			});
			
for(let i = 0; i < result.length; i++) {
		//Log.fire('none','accept',JSON.stringify(result[i]));
    console.log(result[i]);
}
```

#extend

if you want to extend the function of the library,you must know the principle of the thought of this library. Just take the script as a factory,but this factory handle the data which is given by user.Every filter-function like a worker of this factory,they display different roles,but they handle the same data in order position.So the parameter ‘share_data’ is shared by the worker. And the worker use  'this.result.pop()' to get the share_data by pipline.And the worker use 'this.result.push()' to pass the share_data to the next worker.So if you want to extend a function to this library of script is just like employing a mew worker,and you can put it in any position of the pipline. 
