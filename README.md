Instruções rápidas — carregar fotos já presentes no projeto

1) Coloque todas as fotos que quer que apareçam automaticamente dentro de uma pasta chamada `photos` na raiz do projeto (ex: `c:\Users\MÍDIA\Downloads\Site\Amor\photos\`).

2) Gere um arquivo `photos.json` (manifest) listando os caminhos relativos para as imagens. No PowerShell (Windows) execute dentro da pasta do projeto (`c:\Users\MÍDIA\Downloads\Site\Amor`):

```powershell
# Executar no diretório do projeto
# Gera `photos.json` a partir da pasta `photos` (se existir):
$files = Get-ChildItem -Path .\photos -File -Include *.jpg,*.jpeg,*.png,*.gif | ForEach-Object { "photos/" + $_.Name }
$files | ConvertTo-Json | Out-File photos.json -Encoding utf8

# OU: gera `photos.json` a partir dos arquivos de imagem na raiz do projeto:
$files = Get-ChildItem -Path . -File -Include *.jpg,*.jpeg,*.png,*.gif | ForEach-Object { $_.Name }
$files | ConvertTo-Json | Out-File photos.json -Encoding utf8
```

Isso criará `photos.json` no formato:

["photos/imagem1.jpg", "photos/imagem2.png", ...]

3) Abra `index.html` no navegador. O script tentará carregar `photos.json` automaticamente e iniciará o slideshow se houver mais de uma foto.

Observação: alguns navegadores bloqueiam requisições `fetch` quando a página é aberta via `file://`. Para evitar problemas, sirva o diretório com um servidor local simples. Exemplo com Python (no diretório do projeto):

```powershell
python -m http.server 8000
# então abra no navegador: http://localhost:8000/index.html
```

4) Sua esposa ainda pode subir novas fotos diretamente pela página (botão "Adicionar várias fotos" ou arrastar para a moldura). Essas fotos serão incorporadas ao carrossel durante a sessão do navegador.

Se quiser, eu posso:
- gerar um `photos.json` de exemplo agora (com nomes fictícios),
- adicionar configuração na UI para escolher entre "usar fotos da pasta" ou "apenas uploads", ou
- ajustar o carregamento para tentar automaticamente variações de nomes (ex.: photo1.jpg..photo20.jpg).

Diga qual opção prefere que eu aplique a seguir.

---

Alterações recentes:

- `gallery.js`: adicionado utilitário que centraliza a lógica da galeria (fetch de `photos.json`, thumbnails, navegação, autoplay, upload e drag&drop).
- `script_quiz.js`: agora usa `gallery.js` e inicializa a galeria quando o quiz termina.
- `Amor/` foi atualizado para reutilizar `../gallery.js` e evitar duplicação.
- `script.js` (raiz) foi removido por ser não referenciado.

Se algo na sua instalação parar de funcionar, diga qual arquivo específico você estava usando e eu restauro/ajusto conforme necessário.