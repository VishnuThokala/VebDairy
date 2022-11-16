var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose')

var NoteSchema = new Schema({
    
    writtenby :{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        // username:String,
      
    },
    title : {
        type: String,
        required :true,
        
    },
    text : {
        type:String,
        required:true,
    }
})

NoteSchema.plugin(passportLocalMongoose); 
var Note= mongoose.model("Note", NoteSchema);
module.exports =Note; 