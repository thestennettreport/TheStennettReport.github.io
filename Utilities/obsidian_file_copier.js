const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function getFolderPath(prompt) {
  while (true) {
    const folderPath = await askQuestion(prompt);
    if (fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()) {
      return folderPath;
    }
    console.log("Invalid folder path. Please try again.");
  }
}

function getMarkdownFiles(folderPath) {
  let markdownFiles = [];
  function traverseDirectory(currentPath) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        traverseDirectory(filePath);
      } else if (path.extname(file).toLowerCase() === '.md') {
        markdownFiles.push(filePath);
      }
    }
  }
  traverseDirectory(folderPath);
  return markdownFiles;
}

async function copySelectedFiles(sourceFiles, destinationFolder) {
  for (const file of sourceFiles) {
    const fileName = path.basename(file);
    const copy = await askQuestion(`Copy ${fileName}? (y/n) `);
    if (copy.toLowerCase() === 'y') {
      const destinationPath = path.join(destinationFolder, fileName);
      fs.copyFileSync(file, destinationPath);
      console.log(`Copied: ${fileName}`);
    }
  }
}

async function main() {
  console.log("Enter the path to your Obsidian vault folder:");
  const sourceFolder = await getFolderPath("Obsidian vault path: ");

  console.log("\nEnter the path to your GitHub repository folder:");
  const destinationFolder = await getFolderPath("GitHub repository path: ");

  const markdownFiles = getMarkdownFiles(sourceFolder);

  console.log(`\nFound ${markdownFiles.length} markdown files.`);
  await copySelectedFiles(markdownFiles, destinationFolder);

  console.log("\nFile copying complete!");
  rl.close();
}

main().catch(console.error);
