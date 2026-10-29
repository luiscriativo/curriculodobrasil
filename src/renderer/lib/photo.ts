// Foto do currículo: reduz para no máximo 900 px (JPEG) — o arquivo do currículo continua leve.
export async function loadPhoto(file: File): Promise<string> {
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) throw new Error('Use uma imagem JPG, PNG ou WebP.');
  if (file.size > 25e6) throw new Error('A imagem é muito grande (máximo 25 MB).');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const k = Math.min(1, 900 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    const g = c.getContext('2d')!;
    g.fillStyle = '#fff';
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.88);
  } catch (e) {
    throw new Error((e as Error).message.includes('decode') ? 'Não foi possível ler esta imagem.' : (e as Error).message);
  } finally {
    URL.revokeObjectURL(url);
  }
}
