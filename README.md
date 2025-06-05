# SZZ Robot v2

The Robot is a SZZ Chair's delight: it fills in question template files based on a roster table.

## Requirements
- Linux system
- [Bun](https://bun.sh). Developed in version 1.2.1.
- LibreOffice installed in the system

## Installation
```bash
bun install
```

## Running

```bash
./run.sh <directory>
```

The directory is supposed to contain:
- `roster.ods` file with a roster
- `docx` files with question templates; the files must be named according to the Commission column in roster, e.g. 6-NI-MI.docx

The result is generated into the `otazky` subdirectory.

### Roster file

The roster file must have the following structure:
- The first line is a header (ignored).
- Lines that have empty first cell are ignored.
- The relevant lines must have the following structure:
  1. Commission code: must match the template file name (without the extension).
  2. Student name
  3. The following cells must contain two non-empty cells that are taken as:
     - SPOL question text
     - OBOR question text

A roster file example is provided in `roster_example.ods`.

### Question Template Files

Inside the template files, you need to put markers that are replaced by questions text. The markers have the following
structure:
```
{StudentCode_spol}
```
for the SPOL question,
```
{StudentCode_obor}
```
for the OBOR question.

The `StudentCode` is made from the student's name in the roster file by taking first three characters from the first
word and first three characters from the second word. Examples:
- Novak Jan -> NovJan
- Chytra Adela Bc. -> ChyAde
- Wu Tran Yen Chu -> WuTra

