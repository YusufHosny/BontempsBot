const { request } = require('undici');
const urlUSD = 'https://v6.exchangerate-api.com/v6/b11852941060faa0fb027472/latest/USD'
const urlEU =  'https://v6.exchangerate-api.com/v6/b11852941060faa0fb027472/latest/EUR'
module.exports = {
async getRates(){
    const responseEUR = await request(urlEU)
    const responseUSD  = await request(urlUSD)
    const EURjson = await responseEUR.body.json()
    const USDjson = await responseUSD.body.json()
    const EUR = EURjson.conversion_rates.EGP
    const USD = USDjson.conversion_rates.EGP
    var listRates  = [EUR , USD]
    console.log(listRates[0] , listRates[1])
    return listRates
}

}