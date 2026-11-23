/** Small in-memory PDF fixture; never written to the project's media folders. */
export function pdfFixture(sizes) {
  const objects = [null, '<< /Type /Catalog /Pages 2 0 R >>', ''];
  const pages = [];
  for (const [index, [width, height]] of sizes.entries()) {
    const page = objects.length;
    pages.push(`${page} 0 R`);
    const drawing = `${index % 2 ? '.2 .5 .3' : '.1 .2 .7'} rg 0 0 ${width} ${height} re f\n1 1 1 rg 20 20 ${width - 40} ${height - 40} re f\n.1 .1 .1 rg 40 40 ${width / 3} ${height / 3} re f\n`;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << >> /Contents ${page + 1} 0 R >>`);
    objects.push(`<< /Length ${Buffer.byteLength(drawing)} >>\nstream\n${drawing}endstream`);
  }
  objects[2] = `<< /Type /Pages /Count ${sizes.length} /Kids [${pages.join(' ')}] >>`;
  let text = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 1; i < objects.length; i++) {
    offsets[i] = Buffer.byteLength(text);
    text += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(text);
  text += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) text += `${String(offset).padStart(10, '0')} 00000 n \n`;
  text += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(text);
}
