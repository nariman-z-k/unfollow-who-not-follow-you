import puppeteer from "puppeteer";


const browserInit=async()=>{
    browser=await puppeteer.launch({
        executablePath: 'F:/programs/chrome-win/chrome-win/chrome.exe',
        // headless: false,
        timeout:0
    })
    page=await browser.newPage()

}

const getFollow=async (url)=>{
    
    let followers=[]
    while(true){
        await page.goto(url,{timeout:0})

        const pageFollowers=await page.evaluate(()=>{
            let spans1=document.querySelectorAll(".Link--primary")
            let users=Array.from(spans1).map(item=>{
                if(item.innerHTML!='')
                    return item.innerHTML
                else{
                    return item.nextElementSibling.innerHTML
                }
            })
            return users
        
        })
        followers=[...followers,...pageFollowers]
        
        //---------- handle to next button and return the url ---------------------
        url=await page.evaluate(()=>{
            let container=document.querySelector('.pagination')
            if(container.children[1].classList.contains("disabled"))
                return false
            else
                return container.children[1].getAttribute('href')
        })
       
        //---------------- finish scrap condition -----------------
        if (!url)
            break
    }
    return followers
}
async function login(){
    let url='https://github.com/login'
    await page.goto(url,{timeout:0})

    let result=await page.evaluate(async()=>{
        document.querySelector('#login_field').value='your github username'
        document.querySelector('#password').value='your github password'
        document.querySelector('input[name="commit"]').click()
        return true
    })
    await page.waitForNavigation(); 
}

const unfollowBasters=async(differ)=>{
    let url='https://github.com/nariman-z-k?tab=following'
    var targets=[]
    
    
    while(true){
        await page.goto(url,{timeout:0})

        const y=await page.evaluate((differ,targets)=>{
            let name1=''
            let name2=''
           let rows=document.querySelectorAll('.d-table')
           Array.from(rows).forEach((row)=>{
            if(row.querySelector('.Link--primary'))
                name1=row.querySelector('.Link--primary').innerHTML 
            if(row.querySelector('.Link--secondary'))    
                name2=row.querySelector('.Link--secondary').innerHTML
            if(differ.indexOf(name1)>=0 || differ.indexOf(name2)>=0){
                let temp=row.querySelector('input[value="Unfollow"]')
                temp.click()
            }
            name1=''
            name2=''
           })
           return true

        },differ,targets)
        console.log("all basters removed!");
        
        //---------- handle to next button and return the url ---------------------
        url=await page.evaluate(()=>{
            let container=document.querySelector('.pagination')
            if(container.children[1].classList.contains("disabled"))
                return false
            else
                return container.children[1].getAttribute('href')
        })
       
        //---------------- finish scrap condition -----------------
        if (!url)
            break
    }

}
const mainFunction=async()=>{
    await browserInit()
    await login()
    let url='https://github.com/nariman-z-k?tab=followers'
    let followers=await getFollow(url)
    // console.log(followers)
    url='https://github.com/nariman-z-k?tab=following'
    let followings=await getFollow(url)
    // console.log(followings)
    let difference = followings.filter(x => !followers.includes(x));
    console.log(difference) 

    await unfollowBasters(difference)

    await browser.close()

}



let browser
let page
mainFunction()

