const mongoose = require('mongoose');
const Chat = require('../src/models/Chat');
const Item = require('../src/models/Item');

async function fixParticipants() {
  await mongoose.connect('mongodb+srv://Ramkaran_Patel:ramkaran@cluster0.qqguk6k.mongodb.net/LostandFound?retryWrites=true&w=majority&appName=Cluster0'); // update with your DB name

  const chats = await Chat.find({});
  for (const chat of chats) {
    const item = await Item.findById(chat.item);
    if (item) {
      const ownerId = item.postedBy.toString();
      if (!chat.participants.map(id => id.toString()).includes(ownerId)) {
        chat.participants.push(ownerId);
        await chat.save();
        console.log(`Fixed chat ${chat._id}: added owner ${ownerId}`);
      }
    }
  }
  mongoose.disconnect();
}

fixParticipants();