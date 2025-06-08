export default function playSound(sound: string) {
    const src = `/media/${sound}.mp3`;
    new Audio(src).play();
}