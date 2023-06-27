const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items: [{
      productId: { type: Schema.Types.ObjectId, ref:'Product',required: true },
      qty: { type: Number, required: true }
    }]
  }
});

userSchema.methods.addToCart=function(product){
  const cartProduct=this.cart.items.findIndex(cp=>{
    return cp.productId.toString() === product._id.toString();
  })
  if(cartProduct===-1){
    this.cart.items.push({productId:product._id,qty:1});
  }else{
    this.cart.items[cartProduct].qty++;
  }
  return this.save();
}
userSchema.methods.removeFromCart=function(prodId){
  this.cart.items=this.cart.items.filter(i=>{
    return prodId !== i.productId.toString();
  })
  return this.save();
}

module.exports = mongoose.model('User',userSchema);
