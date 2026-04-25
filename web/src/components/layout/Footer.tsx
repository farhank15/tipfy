export const Footer = () => {
  return (
    <footer className="w-full border-t border-neutral-900 py-10 px-6 z-10 flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-600 uppercase tracking-[0.3em]">
      <div>© 2026 Tipfy Protocol. All Rights Reserved.</div>
      <div className="flex gap-10 mt-6 md:mt-0">
        <a href="#" className="hover:text-neon-cyan transition-colors">Twitter</a>
        <a href="#" className="hover:text-neon-pink transition-colors">Discord</a>
        <a href="#" className="hover:text-neon-yellow transition-colors">Github</a>
      </div>
    </footer>
  )
}
