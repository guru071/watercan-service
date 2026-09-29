import pty
import os
import time

def main():
    pid, fd = pty.fork()
    if pid == 0:
        os.execvp("pnpm", ["pnpm", "approve-builds"])
    else:
        time.sleep(2)
        os.write(fd, b"\r")
        time.sleep(1)
        try:
            os.waitpid(pid, 0)
        except:
            pass

if __name__ == "__main__":
    main()
