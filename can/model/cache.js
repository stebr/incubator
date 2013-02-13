steal('can/model/store', 
	  'can/model/list',
	  'can/util/object')
.then(function(){
	
var getTime = function() { return new Date().getTime() };

/**
 * CacheManager is a cache manager that implements LRU Cache Algorithm to
 * keep track of all of the Model.Store instances lists.  It listens for additions and 
 * updates and purges the lists given the least used.
 *
 * More information on LRU can be found at: http://en.wikipedia.org/wiki/Cache_algorithms
 */
can.Construct('Wildcat.Core.CacheManager',
{
	/**
	 * Options available for override via init constructor.
	 */
	options:{
		maxSize: 50,
		expirationSliding: false,
		fillFactor: .95,
		timeThreshold: 150,
		flat: false,
		parentIdentifier: undefined,
		purgeFilter: undefined
	}
},{
	/** 
	 * Sets is a key/value pair mapping of the 
	 * different lists that have been found.
	 * { 
	 * 	  344 : { hits: 5, lastAccessed: 2425356456, params: { ... } },
	 *    345 : { hits: 15, lastAccessed: 2425356456, params: { ... } } 
	 * }
	 **/
	sets: undefined,
	model: undefined,
	options: undefined,
	
	/**
	 * Inits the class and sets up the events for the model.
	 * @param {Object} model
	 * @params {Object} options
	 */
	init:function(model, options) {
		this.model = model;
		this.sets = [];
		this.options = $.extend(this.constructor.options, options || {});
		
		model.bind("created", this.proxy('created'));
		model.bind("destroyed", this.proxy('destroyed'));
		
		model.Store.bind("findAll", this.proxy('findAll'));
		model.Store.bind("findOne", this.proxy('findOne'));
	},
	
	/**
	 * Removes the binds for cleanup.
	 */
	destroy:function(){
		this.model.unbind("created", this.proxy('created'));
		this.model.unbind("destroyed", this.proxy('destroyed'));
		
		this.model.Store.unbind("findAll", this.proxy('findAll'));
		this.model.Store.unbind("findOne", this.proxy('findOne'));
	},
	
	// =============================== Model Events ===============================
	
	/**
	 * Created event was triggered from new model.
	 * @param {Object} event
	 * @param {Object} item
	 */
	created:function(event, item){
		this.purge();
	},
	
	/**
	 * Item was removed.
	 * @param {Object} event
	 * @param {Object} item
	 */
	destroyed:function(event, item){
		if(this.options.parentIdentifier){
			this._removeChildren(item.id);
		}
	},
	
	// =============================== Model.Store Events ===============================
	
	/** 
	 * The Model's Store tirggered a 'findOne' event to signal
	 * that a requests has occured to find an item.
	 *
	 * If a 'findOne' request is executed and the model
	 * is contained within mulitple lists, we are going to 
	 * update all the lists.  This is a bad pratice in general
	 * but could occur and to prevent a unintentional remove
	 * lets just mark them all.
	 *
	 * In some cases, you might have a flat lists where no
	 * 'sets' are contained in the model store.  In this case,
	 * we will just mark the cache off the 'data' object.
	 * 
	 * findOne only purges the data when there is no 'sets'
	 * since relative the amount of data the 'sets' contain
	 * its quite small.
	 *
	 * @param {Object} event
	 * @param {Object} id
	 */
	findOne:function(event, id) {
		if(this.options.flat){
			var matches = [];
			
			$.each(this.model.Store.sets, this.proxy(function(i,set){
				$.each(set.list, this.proxy(function(i,item){
					if(item[this.model.id] === id){
						matches.push(set.params);
					}
				}));
			}));

			if(matches.length){
				$.each(matches, this.proxy(function(i,match){
					this.updateCache(match);
				}));
			} else {
				this.sets.push({
					count: 0,
					lastAccessed: getTime(),
					params: id
				});
			}
		} else {
			this.updateCache(id);
			this.purge();
		}
	},
	
	/**
	 * The Model's Store triggered a 'findAll' event to signal
	 * that a request has occured to find a list of items.
	 * @param {Object} event
	 * @param {Object} params
	 */
	findAll:function(event, params) {
		this.updateCache(params);
		this.purge();
	},
	
	
	// =============================== Public Methods ===============================
	
	/**
	 * Determines if the parameters given are purge eligible or not.
	 * @param {Object} params
	 */
	purgeable:function(params){
		return this.options.purgeFilter === undefined || 
		   this.model.Store.filter(params, this.options.purgeFilter) !== false;
	},
	
	/**
	 * Updates the 'sets' of objects with a current count and
	 * and last accessed dates.
	 * @param {Object} params
	 */
	updateCache:function(params){
		var match = this._setFromParams(params);
		
		if(!match.set){
			this.sets.push({
				count: 0,
				lastAccessed: getTime(),
				params: params,
				purgeable: this.purgeable(params)
			});
		} else {
			this.sets[match.index].count++;
			this.sets[match.index].lastAccessed = getTime();
		}
	},
	
	/** 
	 * Returns the size of the 'sets' collection.
	 */
	size:function(){
		return this.sets.length;
	},
	
	/**
	 * Removes an item from the 'sets' and store.
	 * @param {Object} item
	 **/
	remove:function(item){
		if(item){
			var match = this._setFromParams(item.params);
			if(match.index !== undefined){
				this.sets.splice(match.index, 1)
			}
			
			if(this.options.flat){
				this.model.Store.removeSet(item.params);
			} else {
				this.model.Store.remove(item.params);
			}
		}
	},
	
	/**
	 * Returns if the item is 'expired' or not.
	 * @param {Object} item
	 */
	expired: function(item) {
		return expired = this.options.expirationSliding && 
			(item.lastAccessed + (this.options.expirationSliding * 1000)) < getTime();
	},
	
	/**
	 * Returns the sort order baased on the last accessed time, however,
	 * if the last accessed time is within the threshold specified, 
	 * it looks at the access count and sorts based on that.
	 *
	 * @param {Object} a
	 * @param {Object} b
	 */
	sort: function(a,b){
		var diff = b.lastAccessed - a.lastAccessed;
		return diff < this.options.timeThreshold ? b.count - a.count : diff;
	},
	
	/**
	 * Purges the current lists.
	 */
	purge: function(){ 
		var items = [],
			purgeSize = this.options.maxSize < 0 ? 
						this.size() * this.options.fillFactor : 
						Math.round(this.options.maxSize * this.options.fillFactor);
			
	  	// loop through the cache, expire items that 
		// should be expired otherwise, add the item to an array
		$.each(this.sets, this.proxy(function(i,d){
			if(d){
				if(this.expired(d)){
					this.remove(d);
				} else if(d.purgeable) {
					items.push(d);
				}
			}
		}));
	
		if (items.length > purgeSize) {
	   		items = items.sort(this.proxy('sort'));
	
	   		// remove items from the end of the array
	   		while (items.length > purgeSize) {
	   			var item = items.pop();
	      		this.remove(item);
	   		}
	  	}
	},
	
	
	// =============================== Internal Helpers ===============================
	
	/**
	 * Returns a set from the params.
	 * @param {Object} params
	 */
	_setFromParams:function(params){
		var match, idx;
		
		$.each(this.sets, function(i,s){
			if(can.Object.same(params, s.params)){
				match = s;
				idx = i;
				return false;
			}
		});
		
		return { set: match, 
				 index: idx };
	},
	
	/**
	 * Recursively removes children of a given id.
	 * @param {Object} id to remove
	 * @param {Object} index to pop
	 */
	_removeChildren:function(id,indexes){
		var first = indexes === undefined;
		indexes = indexes || [];

		$.each(this.model.Store.sets, this.proxy(function(i,set){
			if(set.params[this.options.parentIdentifier] === id && indexes.indexOf(i) < 0){
				indexes.push(i);
				
				$.each(set.list, this.proxy(function(index, item){
					this._removeChildren(item.id,indexes);
				}));
			}
		}));
		
		if(first){
			var cachedSets = $.map(indexes, this.proxy(function(sidx,i){
				var storeSet = this.model.Store.sets[sidx],
					cacheSet = this._setFromParams(storeSet.params);
				return cacheSet.set;
			})); 
			$.each(cachedSets, this.proxy(function(i,c){
				this.remove(c);
			}));
		}
	}
});
	
});