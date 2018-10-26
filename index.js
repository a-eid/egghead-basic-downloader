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

// let url = process.argv[2]

let url =
  "https://egghead.io/courses/fully-connected-neural-networks-with-keras?utm_source=drip&utm_medium=email&utm_term=python&utm_content=fully-connected-neural-networks-with-keras&__s=2affdc2bwdzc5hd4cifu"

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
  const cmd = `cd courses/${slug} && youtube-dl -o "%(autonumber)s-%(title)s.%(ext)s" -a list.txt`
  await execp(cmd)
}

main(url)
