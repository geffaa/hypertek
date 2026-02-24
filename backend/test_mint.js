const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './Config/.env' });
require('dotenv').config();

const token = jwt.sign({ id: '676f4144ad78465d6e246db1', role: 'user' }, process.env.JWT_SECRET || 'huehfuhewuifuehu', { expiresIn: '1h' });

async function main() {
    try {
        const res = await axios.post('http://localhost:4700/api/v1/nft/sub-collection/mint', {
            parentId: "676f4144ad78465d6e246db1",
            subCollectionId: "676f4144ad78465d6e246db1",
            tokenURI: "ipfs://test",
            royaltyBps: 500,
            creatorWallet: "0x1357c1fba979baab35561200b2c443ca6866c7b7cdf9438e284613919cf643a7"
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log(JSON.stringify(res.data, null, 2));
    } catch(err) {
        console.error(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    }
}
main();
