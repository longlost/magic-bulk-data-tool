
import minimist from 'minimist';
import processData from './data.js';

const parseArguments = argv => {	
	const args = minimist(argv.slice(2), {
	  string: ['bulk_data_path', 'images_dir', 'start_at']
	});

	if (!args.bulk_data_path) {
	  throw new Error('--bulk_data_path not specified.');
	}

	if (!args.images_dir) {
	  throw new Error('--images_dir not specified.');
	}

	return args;
};


export async function cli(args) {
	const {
		bulk_data_path: dataPath, 
		images_dir: 	  imgsDir,
		start_at: 			startAt
	} = parseArguments(args);
	await processData(dataPath, imgsDir, startAt);
	console.log('Done!');
}