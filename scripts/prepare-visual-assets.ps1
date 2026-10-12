$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
public static class VisualBounds {
  public static Rectangle Find(Bitmap image) {
    int l=image.Width,t=image.Height,r=0,b=0;
    for(int y=0;y<image.Height;y++) for(int x=0;x<image.Width;x++) {
      if(image.GetPixel(x,y).A<128) continue;
      l=Math.Min(l,x);t=Math.Min(t,y);r=Math.Max(r,x+1);b=Math.Max(b,y+1);
    }
    return new Rectangle(l,t,r-l,b-t);
  }
}
'@
$root = Split-Path $PSScriptRoot -Parent
$entries = @()
Get-ChildItem "$root/asset-packs/staging" -Directory | ForEach-Object {
  $pack = $_
  $specDir = "$root/docs/visual/source-specs/$($pack.Name)"
  New-Item -ItemType Directory -Force $specDir | Out-Null
  Get-ChildItem $pack.FullName -Recurse -File | Where-Object { $_.Extension -in '.md','.json','.js','.css' } | ForEach-Object {
    $relative = $_.FullName.Substring($pack.FullName.Length+1)
    $target = Join-Path $specDir $relative
    New-Item -ItemType Directory -Force (Split-Path $target -Parent) | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $target
  }
  Get-ChildItem $pack.FullName -Recurse -Filter '*.png' | ForEach-Object {
    $id=$_.BaseName
    $group=if($id -like 'forest-*'){'maps'}elseif($id -like 'hp-*' -or $id -like 'unit-*'){'combat'}else{'ui'}
    $image=[System.Drawing.Bitmap]::FromFile($_.FullName)
    $crop=[VisualBounds]::Find($image)
    $height=32; $width=[int][Math]::Round($crop.Width*$height/$crop.Height); $slice=@(6,6,6,6)
    if($id -eq 'panel-main') { $width=164;$height=348;$slice=@(6,6,6,6) }
    if($id -like 'tab-*') { $width=160;$height=32;$slice=@(8,8,8,8) }
    if($id -eq 'inventory-slot' -or $id -like 'slot-*' -or $id -eq 'portrait-frame') { $width=64;$height=64;$slice=@(8,8,8,8) }
    if($id -like 'button-*') { $height=32;$width=136;$slice=@(9,9,9,9) }
    if($id -eq 'hp-bar-frame') { $width=96;$height=8;$slice=$null }
    if($id -eq 'hp-bar-fill') { $width=90;$height=5;$slice=$null }
    if($id -eq 'unit-selection-ring') { $width=64;$height=25;$slice=$null }
    if($group -eq 'maps') { $width=1024;$height=1024;$slice=$null }
    $relative="assets/visual/$group/$id.png"
    $target=Join-Path $root $relative
    New-Item -ItemType Directory -Force (Split-Path $target -Parent) | Out-Null
    $out=New-Object System.Drawing.Bitmap($width,$height)
    $graphics=[System.Drawing.Graphics]::FromImage($out)
    $graphics.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $graphics.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $graphics.DrawImage($image,[System.Drawing.Rectangle]::new(0,0,$width,$height),$crop,[System.Drawing.GraphicsUnit]::Pixel)
    $out.Save($target,[System.Drawing.Imaging.ImageFormat]::Png)
    $entries += [ordered]@{id=$id;path=$relative;source_pack=$pack.Name;source_file=$_.FullName.Substring($pack.FullName.Length+1).Replace('\','/');source_dimensions=@($image.Width,$image.Height);derived_dimensions=@($width,$height);crop_rectangle=@($crop.X,$crop.Y,$crop.Width,$crop.Height);nine_slice=$slice;three_slice=$null;padding=if($slice){$slice}else{$null};anchor=if($group -eq 'combat'){'unit-ground'}else{'center'};minimum_size=if($slice){@(24,24)}else{$null};maximum_size=$null;states=@('normal');transformation='Crop alpha >=128 bounds, nearest-neighbor resize. Source ZIP unchanged.';validation='Source contact sheet inspected; slice caps chosen separately from alpha bounds, runtime review required.';limitations=if($id -eq 'portrait-frame'){'Center has baked artifact: retained, not used.'}elseif($id -eq 'forest-grass-texture'){'Seamless unverified; retained, not tiled.'}else{'Source gradients/partial alpha retained; not a strict flat-palette pixel master.'}}
    $entry=$entries[-1]
    $unused=@('portrait-frame','dialogue-frame','forest-grass-texture','hud-value-inset','hud-dropdown-frame','hud-language-frame','hud-journey-frame','hud-menu-frame')
    $entry['used']=($id -notin $unused)
    if(-not $entry.used) { $entry.nine_slice=$null; $entry.padding=$null; $entry.minimum_size=$null }
    if($id -eq 'hp-bar-frame') { $entry.three_slice=@(4,4) }
    if($id -like 'slot-*') { $entry.states=@($id.Substring(5)) }
    if($id -like 'button-*') { $entry.states=@('normal','hover-code','pressed-code','disabled-code') }
    $graphics.Dispose();$out.Dispose();$image.Dispose()
  }
}
[ordered]@{version=1;assets=$entries;forest_playable_rect=@(.18,.19,.82,.81);reference_image='Missing from supplied files; layout follows written specification'} | ConvertTo-Json -Depth 8 | Set-Content "$root/assets/visual/manifest.json" -Encoding UTF8
