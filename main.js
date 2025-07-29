const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// npm install express body-parser fs

const app = express();
const PORT = 3000;
const POSTS_FILE = 'posts.json';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

function getPosts() {
    try {
        return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
    } catch {
        return [];
    }
}

function savePosts(posts) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

function renderPage(posts = [], content = '', title = 'BeBook') {
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #222;
            max-width: 720px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        header {
            margin-bottom: 40px;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            text-decoration: none;
            color: #222;
        }
        .publish-btn {
            float: right;
            background: #222;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'Georgia', serif;
        }
        .content h1, .post-item h2 {
            font-size: 32px;
            margin-top: 0;
            margin-bottom: 16px;
        }
        .post-content {
            font-size: 18px;
        }
        .post-content p {
            margin-bottom: 24px;
        }
        .post-item {
            margin-bottom: 32px;
            padding-bottom: 16px;
            border-bottom: 1px solid #eee;
        }
        .post-item a {
            color: #222;
            text-decoration: none;
        }
        .post-item a:hover {
            text-decoration: underline;
        }
        .post-item small {
            color: #777;
            font-size: 14px;
        }
        .editor {
            display: none;
        }
        .editor input[type="text"] {
            width: 100%;
            padding: 10px;
            font-family: 'Georgia', serif;
            font-size: 24px;
            margin-bottom: 20px;
            border: 1px solid #ddd;
        }
        .editor textarea {
            width: 100%;
            height: 300px;
            font-family: 'Georgia', serif;
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 20px;
            padding: 10px;
            border: 1px solid #ddd;
            resize: vertical;
        }
        footer {
            margin-top: 60px;
            color: #999;
            font-size: 14px;
            text-align: center;
        }
    </style>
</head>
<body>
    <header>
        <a href="/" class="logo">BeBook</a>
        <button class="publish-btn" id="newPostBtn">Новая запись</button>
    </header>

    <main>
        ${content ? `
            <div class="content">
                <h1>${posts.find(p => p.content === content)?.title || 'Без названия'}</h1>
                <div class="post-content">${content}</div>
            </div>
        ` : `
            <div class="posts-list" id="postsList">
                ${posts.map(post => `
                    <div class="post-item">
                        <h2><a href="/post/${post.id}">${post.title}</a></h2>
                        <small>${new Date(post.createdAt).toLocaleString()}</small>
                    </div>
                `).join('')}
            </div>
        `}

        <div class="editor" id="editor">
            <form action="/create" method="POST">
                <input type="text" name="title" placeholder="Заголовок" required>
                <textarea name="content" placeholder="Напишите ваш текст здесь..." required></textarea>
                <button type="submit" class="publish-btn">Опубликовать</button>
            </form>
        </div>
    </main>

    <footer>
        © ${new Date().getFullYear()} BeBook. Просто пишите.
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const newPostBtn = document.getElementById('newPostBtn');
            const editor = document.getElementById('editor');
            const postsList = document.getElementById('postsList');
            const contentDiv = document.querySelector('.content');
            
            if (newPostBtn) {
                newPostBtn.addEventListener('click', function() {
                    if (postsList) postsList.style.display = 'none';
                    if (contentDiv) contentDiv.style.display = 'none';
                    editor.style.display = 'block';
                    editor.querySelector('input').focus();
                });
            }
            
            if (contentDiv) {
                editor.style.display = 'none';
            } else if (postsList) {
                postsList.style.display = 'block';
            }
        });
    </script>
</body>
</html>
    `;
}

app.get('/', (req, res) => {
    const posts = getPosts();
    res.send(renderPage(posts));
});

app.get('/post/:id', (req, res) => {
    const posts = getPosts();
    const post = posts.find(p => p.id === req.params.id);
    if (post) {
        res.send(renderPage(posts, post.content, post.title));
    } else {
        res.redirect('/');
    }
});

app.post('/create', (req, res) => {
    const { title, content } = req.body;
    if (title && content) {
        const posts = getPosts();
        posts.unshift({
            id: Date.now().toString(),
            title,
            content,
            createdAt: new Date().toISOString()
        });
        savePosts(posts);
    }
    res.redirect('/');
});

app.listen(PORT, () => {
    if (!fs.existsSync(POSTS_FILE)) {
        fs.writeFileSync(POSTS_FILE, '[]');
    }
    console.log(`BeBook запущен на http://localhost:${PORT}`);
});
