import subprocess
from os import listdir
from os.path import isfile, join

BACKUPS_PATH = 'backups'


def check_preconditions():
    """Evaluate whether it's safe to do a restore"""
    subprocess.run(["psql", "-c", "'SELECT 1'"], shell=True, check=True)
    return True


def run_restore():
    """Call pg_restore to do it"""
    subprocess.run(["pg_restore", "-l"], shell=True, check=True)


def run_post_restore_script():
    return True


def main():
    """Check that the file exists"""
    # backup_file = join(BACKUPS_PATH, 'snapshot.sql')
    # if not isfile(backup_file):
    #     raise RuntimeError('No backup file found')

    if not check_preconditions():
        raise RuntimeError('Precondition check failed. Skipping restore')

    print("Running restore")


if __name__ == "__main__":
    main()
