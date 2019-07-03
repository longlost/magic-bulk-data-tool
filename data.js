
import path 			from 'path';
import fs 				from 'fs';
import downloader from 'image-downloader';


const cardsToSets = cards => cards.reduce((accum, card) => {
	const {card_faces, digital, set} = card;
	if (digital) { return accum; } // don't learn sets that aren't tangible

	const urls = accum[set] || [];
	if (card_faces) {
		const [front, back] = card_faces;
		if (
			!front.image_uris || 
			!front.image_uris.small
		) { return accum; }

		urls.push(front.image_uris.small, back.image_uris.small);
	}

	const {image_uris} = card;
	if (!image_uris || !image_uris.small) { return accum; }

	urls.push(image_uris.small);
	accum[set] = urls;
	return accum;
}, {});


const wait = millis => new Promise(resolve => {
	setTimeout(() => resolve(), millis);
});

// fetch the download url
// save file to set directory
const saveImage = async (dest, url, retries = 0) => {
	try {
		await fs.promises.mkdir(dest, {recursive: true});
		await downloader.image({dest, url});
	}
	catch (error) {		
		if (error.code && error.code === 'ETIMEDOUT') {
			if (retries > 3) {
				console.log('gave up on ', dest);
				return; 
			}
			await wait(500);
			console.log('retrying...', url);
			await saveImage(dest, url, retries + 1);
		}
		else {
			console.log('saveImage error: ', error);
			if (error.code) {
				console.log('code: ', error.code);
			}
		}
	}
};

// iterate through all sets and download every thumbnail in each set
const saveImages = async (baseDir, sets, startAt = '0') => {
	const alphabetical = Object.keys(sets).sort(); // alphabetical order for use with startAt
	const startIndex = alphabetical.findIndex(set => startAt < set);
	const keys = alphabetical.slice(startIndex);

	if (startAt !== 'a') {
		console.log('sets: ', keys);
	}

	for (const key of keys) {
		const folder = sets[key].length < 100 ? 'other' : key;
		const dest 	 = path.join(baseDir, folder);

		console.log('folder: ', folder);

		for (const url of sets[key]) {
			await saveImage(dest, url);
		}
	}
};
// read bulk scryfall json file and use it to save thumbnail images
// create a folder for each set
// folder name is set code
const processData = async (dataPath, imgsDir, startAt) => {
	// dataPath = './test.json'; // testing only!!
	await fs.promises.mkdir(imgsDir, {recursive: true});
	console.log(`processing card data from ${dataPath}.`);
	const data = await fs.promises.readFile(dataPath);
	const cards = JSON.parse(data);
	const sets = cardsToSets(cards);
	return saveImages(imgsDir, sets, startAt);
};


export default processData;
