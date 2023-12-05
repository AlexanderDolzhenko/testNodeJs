const puppeteer = require('puppeteer');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if(req.resourceType() === 'stylesheet' || req.resourceType() === 'font' || req.resourceType() === 'image'){
            req.abort();
        }
        else {
            req.continue();
        }
    });

    await page.goto('https://www.dns-shop.ru/catalog/17a8d26216404e77/vstraivaemye-xolodilniki/');

    const products = await page.evaluate(() => {
        let items = document.querySelectorAll('.catalog-product');
        let results = [];
        items.forEach((item) => {
            results.push({
                name: item.querySelector('.catalog-product__name span').innerText,
                price: item.querySelector('.product-buy .product-buy__price').innerText
            });
        });
        return results;
    });

    await browser.close();

    const csvWriter = createCsvWriter({
        path: 'products.csv',
        header: [
            {id: 'name', title: 'NAME'},
            {id: 'price', title: 'PRICE'}
        ]
    });

    csvWriter.writeRecords(products)
        .then(() => {
            console.log('...Done');
            console.log('First 5 products:', products.slice(0, 5));
        });
})();