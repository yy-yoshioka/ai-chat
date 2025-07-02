#!/bin/bash
# scripts/build-docs.sh

echo "📚 Building documentation..."

# Build Storybook
echo "Building Storybook..."
npm run build-storybook

# Install TypeDoc if not already installed
if ! command -v typedoc &> /dev/null
then
    echo "Installing TypeDoc..."
    npm install --save-dev typedoc
fi

# Build TypeDoc
echo "Building TypeDoc..."
npx typedoc

# Build architecture docs with mermaid
echo "Building architecture documentation..."
if ! command -v mmdc &> /dev/null
then
    echo "Installing Mermaid CLI..."
    npm install --save-dev @mermaid-js/mermaid-cli
fi

# Convert Mermaid diagrams in markdown files
cd docs
for file in *.md; do
    if grep -q "```mermaid" "$file"; then
        echo "Processing Mermaid diagrams in $file..."
        # Create a temporary file with extracted mermaid content
        awk '/```mermaid/{flag=1;next}/```/{flag=0}flag' "$file" > temp_mermaid.mmd
        if [ -s temp_mermaid.mmd ]; then
            npx mmdc -i temp_mermaid.mmd -o "${file%.md}_diagram.svg"
        fi
        rm -f temp_mermaid.mmd
    fi
done
cd ..

echo "✅ Documentation build complete!"
echo ""
echo "📁 Generated files:"
echo "  - Storybook: ./storybook-static/"
echo "  - TypeDoc: ./docs/components/"
echo "  - Architecture diagrams: ./docs/*_diagram.svg"