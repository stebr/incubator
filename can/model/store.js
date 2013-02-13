/**
* Store implements a cache layer for the Model. The Store object can be referenced from the Model Object. E.g. Wildcat.Models.Item.Store.get(id);
* For the documentation, lets say we have 2 types of Models: 
* Item Model : We can organize the model instances data in sets, each set containing children of a parent.
* Contact Model: All model instances are independent.
*
* The current store implementation caters to both type of data structures.
*
* 1. API
* 2. Events
* 2. Design
* 
* 1. APIs
* Model.Store.findOne: 
* Model.Store.findAll:
* Model.Store.get:
* Model.Store.remove:
* 
* Note: Model.Store.findOne uses the Model.findOne method to fetch the modelInstance if it is not in the cache. The existing Model.findOne makes a direct request to the network, bypassing the cache.
* 
* 2. Events:
* List of events triggered to or listened to by the Store ?
*
* 3. Design
* 1. How the data is stored in Store.data and Store.sets. See doc: https://connect.mindjet.com/link/#!file=7cf87638-1ade-4067-94a9-f5f373c748ed
* 2. Behavior on the Model events: Item.updated, .created, .deleted :
*    2.1 if Model instance is a file ?
*    2.2 if Model instance is a folder(parent) ?
*    2.3 if there is any difference in the behavior of Item Model type and the Contact Model type.
* 3. When does the Cache entries get dirty ? 
* 4. Considerations for CRUD operations and how they affect the cache management that uses Least Recently Used(LRU) algorithm to manage the cache.?
* 
* GET : findOne for a file id or  and findAll ?
* PUT : 
* POST
* DEL
*
* 5. LRU algorithm implementation details and configuration options ?
*/

steal('jquery/model/list','jquery/lang/object', function($){

var same = $.Object.same,
	trigger = function(obj, event, args){
		$.event.trigger(event, args, obj, true)
	},
	$method = function( name ) {
		return function( eventType, handler ) {
			return $.fn[name].apply($([this]), arguments);
		}
	},
	bind = $method('bind'),
	unbind = $method('unbind');


$.Class('jQuery.Model.Store',
{
	bind: bind,
	unbind: unbind,
	compare : {},
	
	init : function(){
		if(this.fullName === 'jQuery.Model.Store'){
			return;
		}
		
		this.sets = [];
		this.data = {};
		this.pending = {};
		this.id = this.namespace.id;
		
		// listen on create and add ... listen on destroy and remove
		this.namespace.bind('destroyed', this.proxy('destroyed'));
		this.namespace.bind('updated', this.proxy('updated'));
		this.namespace.bind("created", this.proxy('created'));
	},
	
	
	// =============================== Model Events ===============================
	
	/**
	 * Creates an item in the sets.  Triggered from a model
	 * event indicating an item was created.
	 *
	 * @param {Object} event
	 * @param {Object} item
	 */
	created: function(ev,item){
		this.add([item]);
	},
	
	/**
	 * Updates an item in the sets.  Triggered from a model
	 * event indicating an item was updated.
	 *
	 * @param {Object} event
	 * @param {Object} item
	 */
	updated: function(ev, item){
		var id = item[this.id];	
		if(this.data[id]){
			this.update(this.data[id], item);
		}

		for(var i=0, length = this.sets.length; i < length; i++){
			var set = this.sets[i],
				inSet = this.filter(item, set.params) !== false,
				inList = set.list.get(item)[0];
			
			if(inSet && !inList){
				set.list.push(item)
			} else if(!inSet && inList) {
				set.list.remove(item[this.id])
			}
		}
	},
	
	/** 
	 * Destroy triggered by model event.  
	 * Calls remove function to remove item from lists.
	 *
	 * @param {Object} event
	 * @param {Object} item
	 */
	destroyed : function(ev,item){
		this.remove(item[this.id]);
	},
	
	
	// =============================== API ===============================
	
	/**
	 * @function get
	 *
	 * Retrieves an item(s) given an id or array of ids from the global data
	 * set of the model store.  If the item is not returned yet, it will return
	 * null.
	 *
	 * @codestart
	 * var model = $.Model.Store.get(222);
	 * @codeend
	 *
	 * @codestart
	 * var models = $.Model.Store.get([222, 223, 224]);
	 * @codeend
	 *
	 * @param {Object} id int or array of ints
	 */
	get : function(id){
		if($.isArray(id)) {
			var returnArr = [];
			
			$.each(id, this.proxy(function(i,d){
				var m = this.data[d];
				m && returnArr.push(m);
			}));
			
			return returnArr;
		} else {
			return this.data[id];
		}
	},
	
	/**
	 * @function filterSets
	 *
	 * Retrieves sets given a filter input.
	 *
	 * @codestart
	 * var sets = $.Model.Store.filterSets({parentId:122,type:'file'});
	 * @codeend
	 *
	 * @param {Object} filter  
	 */
	filterSets: function(filter){
		var matches = [];
		for( var i=0,len=this.sets.length; i<len; i++){
			var set = this.sets[i];
			if( $.Object.subset(set.params,filter)){
				matches.push(set);
			}
		}
		return matches;
	},

	/**
	 * @function findOne
	 *
	 * FindOne attempts to retrieve an individual model
	 * from the sets of currently fetched data.  If the model
	 * was not previously fetched, it will then execute a request on the 
	 * static 'findOne' method of the model.  It returns
	 * the deferred object.
	 * 
	 * @codestart
	 * $.Model.Store.findOne(222).done(success);
	 * @codeend
	 *
	 *
	 * You can listen for 'findOne' to be triggered by
	 * binding to the 'findOne' event on the class.
	 *
	 * @codestart
	 * $.Model.Store.bind('findOne', function(id){ ... });
	 * @codeend
	 *
	 *
	 * @param {Object} id of item
	 * @param {Function} success handler
	 * @param {Function} error handler
	 **/
	findOne : function(id, success, error){
		var data = this.data[id],
			def = this.pending[id];
			
		if (data){ // resolve cached item immediately
			def = $.Deferred().done(success).resolve(data);
		} else if (def) {
			def.done(success).fail(error);
		} else {
			def = this.namespace.findOne({ id: id });
			this.pending[id] = def;
			def.done(this.proxy(function(item){
				//this.data[id] = item;
				this.add([item]);
				delete this.pending[id];
			})).done(success)
			.fail(this.proxy(function(){
				delete this.data[id];
				delete this.pending[id];
			})).fail(error);
		}
		
		trigger(this, 'findOne', id);
		
		return def;
	},

	/**
	 * @function findAll
	 *
	 * FindAll attempts to retrieve a list of model(s)
	 * from the sets of currently fetched data.  If the model(s)
	 * were not previously fetched, it will then execute a request on the 
	 * static 'findAll' method of the model.  It returns
	 * the deffered object. 
	 * 
	 * @codestart
	 * $.Model.Store.findAll({ parentId: 2222 }).done(success);
	 * @codeend
	 *
	 *
	 * You can listen for 'findAll' to be triggered by
	 * binding to the 'findAll' event on the class.
	 *
	 * @codestart
	 * $.Model.Store.bind('findAll', function(params){ ... });
	 * @codeend
	 *
	 *
	 * @param {Object} params
	 * @param {Boolean} register registers this list as owning some content, but does not
	 * @param {Boolean} ready
	 **/
	findAll : function(params, success){

		for(var i =0, length = this.sets.length; i < length; i++){

			var set = this.sets[i];
			if( $.Object.subset(params, set.params, this.compare) ){
				if( $.Object.same(set.params, params, this.compare) ){

					if(set.def.isResolved()){
						setTimeout(function(){
							success && success(set.list);
						}, 1);
					} else {
						set.def.done(function(){
							success && success(set.list)
						});
					}
					
					trigger(this, 'findAll', params);
					
					return set.list;
				}
			}
		}

		var list = new this.namespace.List(),
			set = {
				params: $.extend({}, params),
				list: list,
				def: this.namespace.findAll(params)
			}, self = this;
			
		this.sets.push(set);
		
		set.def.done(function(items){
			self.add(items, params);
		}).done(function(){
			success && success(set.list)
		});

		trigger(this, 'findAll', params);
		
		return list; 
	},
	
	/**
	 * @function remove
	 *
	 * Removes an item from the sets.
	 *
	 * @param {Object} id
	 */
	remove:function(id){
		var item = this.data[id];
		
		if(item){
			var sets = this.sets.slice(0);
			for(var i=0, length=this.sets.length; i < length; i++){
				var set = sets[i],
					inSet = this.filter(item, set.params) !== false,
					inList = set.list.get(item)[0];

				if(inSet && inList) {
					set.list.remove(item[this.id])
				}
			}

			delete this.data[id];
		}
	},
	
	/**
	 * @function removeSet
	 * 
	 * Removes a set given a parms object and 
	 * removes each one of the items from the data.
	 *
	 * @param {Object} params
	 */
	removeSet: function(params){
		var match = -1;
		
		for(var i=0, length=this.sets.length; i < length; i++){
			var set = this.sets[i];
			
			if($.Object.same(params, set.params, this.compare)){
				for(var j=0, jlength=set.list.length; j < jlength; j++){
					delete this.data[set.list[j][this.id]];
				}
				
				match = i;
				break;
			}
		}
		
		(match !== -1) && this.sets.splice(match, 1);
	},
	
	/**
	 * @function pagination
	 *
	 * Paginates the item in place. By default uses an order 
	 * property in the param of the class.
	 *
	 * @codestart
	 * var models = $.Model.Store.pagination(myModelListInstance);
	 * @codeend
	 *
	 * @param {Object} items
	 * @param {Object} params
	 */
	pagination : function(items, params){
		var offset = parseInt(params.offset, 10) || 0,
			limit = parseInt(params.limit, 10) || (items.length - offset);
		
		return items.slice(offset, offset + limit);
	},
	
	
	// =============================== Internals ===============================
	
	/**
	 * Internal compare method.
	 * 
	 * @param {Object} prop
	 * @param {Object} itemData
	 * @param {Object} paramData
	 */
	_compare : function(prop, itemData, paramData){
		return same(itemData, paramData, this.compare[prop]);
	},
	
	/**
	 * @function update
	 *
	 * Updates the properties of currentItem
	 *
	 * @param {Object} currentItem
	 * @param {Object} newItem
	 */
	update : function(currentItem, newItem){
		try {
            currentItem.attrs(newItem.serialize());
        } catch (e) { }
	},
	
	/**
	 * @function sort
	 *
	 * Returns if a set contains the parameters.
	 * 
	 * @param {Object} params
	 **/
	has : function(params){
		return $.Object.subsets(params, this.sets).length
	},
	
	/**
	 * @function add
	 *
	 * Adds items to the set(s) given the matching params.
	 *
	 * @param {Object} items
	 */
	add : function(items){
		var added = [];
			
		for(var i =0, len = items.length; i< len; i++){
			var item = items[i],
				id = item[this.id];
			
			if(this.data[id]){
				this.update(this.data[id], item);
				added.push(item)
			} else {
				added.push(this.data[id] = item);
			}	
		}
		
		for(var i=0, iLength = this.sets.length; i < iLength; i++){
			var set = this.sets[i],
				itemsForSet = [];
			
			for(var j =0, jLength = added.length; j< jLength; j++){
				var item = added[j],
					inList = set.list.get(item)[0],
					inSet = this.filter(item, set.params) !== false;
				
				if(inSet && !inList) {
					itemsForSet.push(item)
				}
			}
			
			if(itemsForSet.length) {
				set.list.push(itemsForSet);
			}
		}
	},
	
	/**
	 * @function filter
	 *
	 * Called with the item and the current params.
	 * Should return __false__ if the item should be filtered out of the result.
	 * 
	 * By default this goes through each param in params and see if it matches the
	 * same property in item (if item has the property defined).
	 *
	 * @param {Object} item
	 * @param {Object} params
	 */
	filter : function(item, params){
		// go through each param in params
		var param, paramValue
		for (var param in params ) {
			i=0;
			paramValue = params[param];
			
			// in fixtures we ignore null, I don't want to now
			if (paramValue !== undefined && item[param] !== undefined 
				 && !this._compare(param, item[param], paramValue)) {
				return false;
			}
		}
	},
	
	/**
	 * @function sort
	 *
	 * Sorts the object in place. By default uses an order 
	 * property in the param of the class.
	 *
	 * @codestart
	 * var models = $.Model.Store.sort(myModelListInstance);
	 * @codeend
	 *
	 * @param {Object} items
	 * @param {Object} params
	 */
	sort : function(items, params){
		$.each((params.order || []).slice(0).reverse(), function( i, name ) {
			var split = name.split(" ");
			items = items.sort(function( a, b ) {
				if ( split[1].toUpperCase() !== "ASC" ) {
					if( a[split[0]] < b[split[0]] ) {
						return 1;
					} else if(a[split[0]] == b[split[0]]){
						return 0
					} else {
						return -1;
					}
				}
				else {
					if( a[split[0]] < b[split[0]] ) {
						return -1;
					} else if(a[split[0]] == b[split[0]]){
						return 0
					} else {
						return 1;
					}
				}
			});
		});
		return items
	},
	
	/**
	 * @function findAllCached
	 *
	 * FindAll attempts to retrieve a list of model(s)
	 * only from the cache.
	 *
	 * @param {Object} params
	 **/
	findAllCached : function(params){
		// remove anything not filtering ....
		//   - sorting, grouping, limit, and offset
		
		var list = [],
			data = this.data,
			item;
			
		for(var id in data){
			item = data[id];
			if( this.filter(item, params) !== false) {
				list.push(item)
			}
		}
		
		// do sorting / grouping
		list = this.pagination(this.sort(list, params), params);
		
		// take limit and offset ...
		return list;
	}
},{ });

});