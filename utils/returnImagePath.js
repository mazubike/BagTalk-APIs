function returnImagePath(filename, folder) {
    return filename ? `${process.env.BASE_URL}/public/media/${folder}/${filename}` : null;
};

module.exports = returnImagePath ;