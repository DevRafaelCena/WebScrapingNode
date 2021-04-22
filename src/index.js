const puppeteer = require('puppeteer')
var excel = require('excel4node')
var workbook = new excel.Workbook();


async function amazonAuto() {

  try {
    const browser = await puppeteer.launch({
      headless: false //false = mostra o navegador
    })
    const page = await browser.newPage()
    await page.setViewport({ //configurando tamanho da tela do navegador
      width: 1920,
      height: 1080
    })
    await page.goto('https://www.amazon.com.br/', {
      timeout: 300000000 //timeout de execução
    })

    await page.waitForSelector('#twotabsearchtextbox') //procura input de busca

    await page.type('#twotabsearchtextbox', 'iphone') //popula input 

    await page.keyboard.press('Enter') //pressiona o enter

    await page.waitForTimeout(5000) //aguarda x tempo

    const list = await page.evaluate(() => {
      let data = []
      const lista = document.querySelectorAll('.s-result-list > div'); //busca s divs de dos resultados

      for (let i = 1; i < 60; i++) { // percorre array popula a variavel data com os campos necessarios     
        data.push({
          'title': lista[i].querySelector('.a-size-base-plus').textContent,

          'price': !lista[i].querySelector('.a-price-whole') ? "Sem preço" : lista[i].querySelector('.a-price-whole').textContent + lista[i].querySelector('.a-price-fraction').textContent
        })
      }

      return data;
    })

    await page.waitForTimeout(3000) //aguarda x tempo
    await browser.close(); //fecha navegador

    return list


  } catch (error) {
    // display errors
    console.log(error)
  }
}


amazonAuto().then((result) => {

  var worksheet = workbook.addWorksheet('Relação 1'); //cria uma aba no excell

  var style = workbook.createStyle({
    font: {
      size: 12
    },
  });
  //cabeçalho
  worksheet.cell(1, 1).string("Produto").style(style);
  worksheet.cell(1, 2).string("Preço").style(style);

  for (var i = 0; i < result.length; i++) {

    worksheet.cell(2 + i, 1).string(result[i].title).style(style);
    worksheet.cell(2 + i, 2).string(result[i].price).style(style);
    worksheet.column(1).setWidth(50)

  }

  workbook.write('Produtos.xlsx'); //salva o xlsx

})