from setuptools import setup

setup(
    name='ctvu',
    version="0.1",
    author='Mario Balibrera',
    author_email='mario.balibrera@gmail.com',
    license='MIT License',
    description='World Builder plugin for cantools (ct)',
    long_description='Connective tissue and basic interfaces for virtual world builders and applications.',
    packages=[
        'ctvu'
    ],
    zip_safe = False,
    install_requires = [
    ],
    entry_points = '''''',
    classifiers = [
        'Development Status :: 3 - Alpha',
        'Environment :: Console',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Software Development :: Libraries :: Python Modules'
    ],
)
