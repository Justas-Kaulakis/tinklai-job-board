Justas Kaulakis © 2025 Tinklai Job Board. Visos teisės saugomos.
**"T120B145 Kompiuterių tinklai ir internetinės technologijos" IT projektas**

## INSTALIAVIMAS

Atnaujinam paketus

```bash
sudo apt update
```

Parsiunčiam Nodejs

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
nvm install 20
```

Parsisiunčiam kodą

```bash
git clone https://github.com/Justas-Kaulakis/tinklai-job-board.git
cd tinklai-job-board
```

Sukuriam aplankalą

```bash
mkdir data
```

Instaliuoti paketus

```bash
npm install
```

Sugeneruoti papildomą kodą

```bash
npm run db:generate
```

Sukurti DB failą su pradiniais duomenimis

```bash
npm run db:migrate
```

> (Jei mašinai trūksta atminties: [**How to Resize VirtualBox Virtual Hard Disk | Baeldung on Linux**](https://www.baeldung.com/linux/virtualbox-resize-hard-disk))

Sukompiliuoti aplikaciją

```bash
npm run build
```

## Paleisti tinklapį

```bash
npm run start
```

_Tinklapis bus pasiekiamas per [http://localhost:3000/](http://localhost:3000/)_

---

Norint pamatyti DB (naujame terminale)

```bash
npm run db:studio
```

_Matomas per [http://localhost:5555/](http://localhost:5555/)_
