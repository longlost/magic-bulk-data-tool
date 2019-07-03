# magic-bulk-data-tool
node.js script that saves card thumbnails to separate 'set' folders for use with node-tfjs-retrain module


## Example Usages

-   Save Magic card images for use in retraining an ml classifier:  
    `node index.js --bulk_data_dir="C:/scryfall/bulk_data" --images_dir="C:/scryfall/images"`