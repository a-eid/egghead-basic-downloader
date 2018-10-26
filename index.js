import path from "path"
import fs from "fs"
import os from "os"
import youtubedl from "youtube-dl"
import r from "request-promise-native"
import cheerio from "cheerio"
import { promisify } from "util"
import { spawnSync, exec } from "child_process"

const getInfo = promisify(youtubedl.getInfo)
const execp = promisify(exec)

let url = process.argv[2]

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const download = async cmd => {
  console.log("downloading lessons...")
  await execp(cmd).catch(async err => {
    console.log(`something went wront retrying...`)
    console.log(`sleeping for 30 seconds`)
    await sleep(30000)
    download(cmd)
  })
  console.log(`sleeping for 10 seconds`)
  await sleep(10000)
}
// document.querySelectorAll("[href*='/lessons/']").forEach( a => console.log(a.href))
async function main(url) {
  const html = await r(url)
  const $ = cheerio.load(html)
  const {
    course: { slug, lessons },
  } = JSON.parse($(`[data-component-name]`).html(), null, 2).course
  const urls = lessons.map(l => l.lesson_url.replace("/api/v1", ""))
  let commonPath = [__dirname, "courses"]
  try {
    fs.mkdirSync(path.join(...commonPath, slug))
  } catch {}
  const urlsPath = path.join(...commonPath, slug, "list.txt")
  fs.existsSync(urlsPath) && fs.unlinkSync(urlsPath)
  urls.forEach(url => {
    fs.appendFileSync(urlsPath, `${url} \n`)
  })

  console.log(`sleeping 20 seconds between downloads`)
  const cmd = `cd courses/${slug} && youtube-dl -o "%(autonumber)s-%(title)s.%(ext)s" -a list.txt --socket-timeout 5 --sleep-interval 20`
  await download(cmd)
}

console.log("initiate download...")
main(url)
