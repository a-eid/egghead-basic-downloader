import path from "path"
import fs from "fs"
import os from "os"
import youtubedl from "youtube-dl"
import r from "request-promise-native"
import cheerio from "cheerio"
import { promisify } from "util"
import { spawnSync, exec } from "child_process"
import logger from "./lib/logger"

const getInfo = promisify(youtubedl.getInfo)
const execp = promisify(exec)

let url = process.argv[2]

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const download = async cmd => {
  logger("downloading lessons...")
  await execp(cmd).catch(async err => {
    logger(`${err} - something went wront retrying...`, { result: "error" })
    logger(`sleeping for 30 seconds`)
    await sleep(30000)
    download(cmd)
  })
  logger(`Success! sleeping for 10 seconds`, { result: "success" })
  await sleep(10000)
}
// document.querySelectorAll("[href*='/lessons/']").forEach( a => console.log(a.href))
async function main(url) {
  const html = await r(url)
  const $ = cheerio.load(html)

  let { course, playlist } = JSON.parse($(`[data-component-name]`).html())
  let slug
  let lessons = []

  if (course) {
    slug = course.course.slug
    lessons = course.course.lessons.map(item => item.url)
  } else if (playlist) {
    slug = playlist.slug
    lessons = playlist.items.map(item => item.url)
  }

  // strip `/api/v1`
  lessons = lessons.map(l => l.replace("/api/v1", ""))
  let commonPath = [__dirname, "courses"]

  try {
    fs.mkdirSync(path.join(__dirname, "courses"))
  } catch {}

  try {
    fs.mkdirSync(path.join(...commonPath, slug))
  } catch {}

  const urlsPath = path.join(...commonPath, slug, "list.txt")
  fs.existsSync(urlsPath) && fs.unlinkSync(urlsPath)
  lessons.forEach(url => {
    fs.appendFileSync(urlsPath, `${url} \n`)
  })

  logger(`sleeping 20 seconds between downloads`)
  const cmd = `cd courses/${slug} && youtube-dl -o "%(autonumber)s-%(title)s.%(ext)s" -a list.txt --socket-timeout 5 --sleep-interval 20`
  await download(cmd)
}

logger("initiate download...")
main(url)
