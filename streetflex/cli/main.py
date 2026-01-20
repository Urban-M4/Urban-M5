import cloup
import subprocess as sp
import shlex

from streetflex import conf


@cloup.command()
def run():
    '''Main entry point to run the app.'''

    cli = shlex.split("reflex run")
    sp.Popen(cli, cwd=conf.root_dir)
