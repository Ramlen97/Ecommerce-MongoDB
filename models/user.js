const mongodb=require('mongodb');
const { get } = require('../routes/admin');
const getDb = require('../util/database').getDb;

const ObjectId=mongodb.ObjectId;

class User{
  constructor(name,email,cart,id){
    this.name=name,
    this.email=email,
    this.cart=cart,
    this._id=new ObjectId(id);
  }

  save(){
    const db=getDb();
    return db.collection('users').insertOne(this)
  }

  addToCart(product){
    const cartProduct=this.cart.items.findIndex(cp=>{
      return cp.productId.toString() === product._id.toString();
    })    

    if(cartProduct===-1){
      const newItem={productId:new ObjectId(product._id),qty:1}
      this.cart.items.push({productId:new ObjectId(product._id),qty:1});
    }else{
      this.cart.items[cartProduct].qty++;
    }

    const db=getDb();
    return db.collection('users').updateOne(
      {_id:this._id},
      {$set:{cart:this.cart}}
    );
  }

  getCart(){
    const db=getDb();
    const productIds=this.cart.items.map(product=>{
      return product.productId;
    })
    return db.collection('products').find({_id:{$in:productIds}}).toArray()
    .then(products=>{
      return products.map(p=>{
        const qty=this.cart.items.find(i=>{
          return i.productId.toString() === p._id.toString();
        }).qty;
        return{...p,qty};
      })
    })
  }

  deleteProductFromCart(prodId){
    const db=getDb();
    this.cart.items=this.cart.items.filter(i=>{
      return prodId !== i.productId.toString();
    })
    return db.collection('users').updateOne({_id:this._id},{$set:{cart:this.cart}});
  }

  addOrder(){
    const db=getDb();
    return this.getCart()
    .then(products=>{
      const order={
        items:products,
        user:{
          _id:this._id,
          name:this.name
        }
      }
      return db.collection('orders').insertOne(order)      
    })
    .then(result=>{
      return db.collection('users').updateOne({_id:this._id},{$set:{cart:{items:[]}}});
    })
  }

  getOrders(){
    const db=getDb();
    return db.collection('orders').find({'user._id':this._id}).toArray();
  }

  static findById(userId){
    const db=getDb();
    return db.collection('users').findOne({_id:new ObjectId(userId)})
  }
}

module.exports = User;
