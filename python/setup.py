#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
SIGHT ONE (瞰析 ONE) - Setup Configuration
Package installation and distribution configuration
"""

from setuptools import setup, find_packages
from pathlib import Path

# Read the contents of README file
this_directory = Path(__file__).parent
long_description = (this_directory / "INSTALLATION.md").read_text(encoding='utf-8') if (this_directory / "INSTALLATION.md").exists() else ""

# Read requirements
def read_requirements(filename):
    """Read requirements from file"""
    requirements_path = this_directory / filename
    if not requirements_path.exists():
        return []
    
    with open(requirements_path, 'r', encoding='utf-8') as f:
        return [
            line.strip() 
            for line in f 
            if line.strip() and not line.startswith('#') and not line.startswith('-r')
        ]

# Core dependencies
install_requires = read_requirements('requirements.txt')

# Development dependencies
dev_requires = read_requirements('requirements-dev.txt')

# Package metadata
setup(
    # Basic information
    name="sight-one-backend",
    version="1.0.0",
    description="SIGHT ONE - Intelligent Vision Analysis Platform Backend",
    long_description=long_description,
    long_description_content_type="text/markdown",
    
    # Author information
    author="SIGHT ONE Team",
    author_email="contact@sightone.ai",
    url="https://github.com/your-org/sight-one",
    
    # License
    license="MIT",
    
    # Packages
    packages=find_packages(exclude=['tests', 'tests.*', 'backup_*']),
    include_package_data=True,
    
    # Python version requirement
    python_requires='>=3.9',
    
    # Dependencies
    install_requires=install_requires,
    
    # Optional dependencies
    extras_require={
        'dev': dev_requires,
        'gpu': [
            'torch>=2.0.0',
            'torchvision>=0.15.0',
        ],
        'all': dev_requires,
    },
    
    # Entry points
    entry_points={
        'console_scripts': [
            'sight-one=drone_backend:main',
            'sight-one-test=test_installation:main',
        ],
    },
    
    # Classifiers
    classifiers=[
        # Development Status
        'Development Status :: 4 - Beta',
        
        # Intended Audience
        'Intended Audience :: Developers',
        'Intended Audience :: Science/Research',
        
        # Topic
        'Topic :: Scientific/Engineering :: Artificial Intelligence',
        'Topic :: Scientific/Engineering :: Image Recognition',
        
        # License
        'License :: OSI Approved :: MIT License',
        
        # Python versions
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Programming Language :: Python :: 3.12',
        
        # Operating Systems
        'Operating System :: OS Independent',
        'Operating System :: Microsoft :: Windows',
        'Operating System :: POSIX :: Linux',
        'Operating System :: MacOS',
    ],
    
    # Keywords
    keywords=[
        'computer-vision',
        'ai',
        'machine-learning',
        'drone',
        'yolo',
        'object-detection',
        'image-analysis',
    ],
    
    # Project URLs
    project_urls={
        'Bug Reports': 'https://github.com/your-org/sight-one/issues',
        'Documentation': 'https://docs.sightone.ai',
        'Source': 'https://github.com/your-org/sight-one',
    },
    
    # Package data
    package_data={
        '': ['*.md', '*.txt', '*.yaml', '*.yml'],
    },
    
    # Exclude
    exclude_package_data={
        '': ['*.pyc', '__pycache__', '*.log'],
    },
    
    # Zip safe
    zip_safe=False,
)
