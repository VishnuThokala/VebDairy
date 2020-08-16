var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose')

User = mongoose.Schema()
var DairySchema = new Schema({
    writtenby :{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username:String,
      
    },
    title : {
        type: String,
        required :true,
        
    },
    date : {
        type : Date ,
        default: Date.now,
       
        
    },
    img:{
        type:{ data: Buffer, contentType: String }
    },
    main : {
        type:String,
        required:true,
    }
})

DairySchema.plugin(passportLocalMongoose); 
var Dairy= mongoose.model("Dairy", DairySchema);
module.exports =Dairy; 