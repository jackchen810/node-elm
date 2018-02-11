'use stict';

import mongoose from 'mongoose'

const idsSchema = new mongoose.Schema({
	rom_id: Number,
	pkg_id: Number,
	script_id: Number,
	task_id: Number,
	device_id: Number,
	img_id: Number,
	admin_id: Number,
});

const Ids = mongoose.model('Ids',idsSchema);

Ids.findOne((err, data) => {
	if(!data) {
		const newIds = new Ids({
			rom_id: 0,
			pkg_id: 0,
			script_id: 0,
			task_id: 0,
			device_id: 0,
			img_id: 0,
			admin_id: 0,
		});
		newIds.save();
	}
})
export default Ids
