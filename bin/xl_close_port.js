#!/usr/bin/env node

const child_process = require('child_process')
var path = require('path');
var argv = require('yargs').argv
var program = require('commander')
var chalk = require('chalk')
var shell = require('shelljs')
const { exec} = require('shelljs')

// 如果存在本地的命令，执行本地的
try {
    var localWebpack = require.resolve(path.join(process.cwd(), "node_modules", "xl-close_port", "bin", "xl-close_port.js"));
    if (__filename !== localWebpack) {
        return require(localWebpack);
    }
} catch (e) {
}


let package = JSON.parse(shell.cat(path.join(__dirname, '../package.json')))


program
    .version(package.version)
    .usage('[cmd] [options]')
    .option('-p', '端口号')
    .action((path) => {
        var child = child_process.spawn('lsof',[
            '-i',
            `:${argv.p}`,
        ])
        child.stdout.on('data', rst => {
            let data = rst.toString('utf8', 0, rst.length)
            let port = null;
            data.split(/[\n|\r]/).forEach(item=>{
                if(item.indexOf('LISTEN') !== -1 && !port){
                    let reg = item.split(/\s+/)
                    if(/\d+/.test(reg[1])){
                        port = reg[1]
                    }
                }
            })
            if(!port){
                console.log(chalk.yellow(`端口 ：${argv.p} close!`))
                return
            }
            exec(`kill -9 ${port}`,()=>{
                console.log(chalk.blue(`关闭端口 ${argv.p} 成功！`))
            })
        });
        child.stderr.on('data', rst => {
            let data = rst.toString('utf8', 0, rst.length)
            console.log(data)
        });
    })

program.parse(process.argv)
