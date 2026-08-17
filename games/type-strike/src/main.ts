const canvas = document.getElementById('game') as HTMLCanvasElement;
canvas.width = 800;
canvas.height = 600;

const ctx = canvas.getContext('2d');
if (ctx) {
  ctx.fillStyle = '#d63031';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Type Strike', canvas.width / 2, canvas.height / 2 - 30);
  ctx.font = '24px sans-serif';
  ctx.fillText('Coming Soon', canvas.width / 2, canvas.height / 2 + 30);
}
